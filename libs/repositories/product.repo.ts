import mongoose, { PipelineStage } from "mongoose";
import connectMongoDB from "../connnectMongoDB";
import { Product } from "../models";

type AggregateProductsParams = {
  match?: Record<string, unknown>;
  colorIds?: mongoose.Types.ObjectId[];
  sizeIds?: mongoose.Types.ObjectId[];
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
};

type RecommendationType = "trending" | "related" | "new";

type GetRecommendedParams = {
  type?: RecommendationType;
  productId?: string;
  categoryId?: string;
  genderId?: string;
  limit?: number;
};

export async function aggregateProducts(params: AggregateProductsParams) {
  await connectMongoDB();

  const {
    match = {},
    colorIds = [],
    sizeIds = [],
    sort = { createdAt: -1 },
    limit = 20,
    skip = 0,
  } = params;

  const pipeline: PipelineStage[] = [
    // 1. Base match (category, gender, published, etc.)
    {
      $match: match,
    },

    // 2. Attach variants
    {
      $lookup: {
        from: "productvariants",
        localField: "_id",
        foreignField: "productId",
        as: "variants",
      },
    },
  ];

  // 🔥 Variant filtering (color + size must match SAME variant)
  const variantElem: Record<string, unknown> = {};

  if (colorIds.length) {
    variantElem.colorId = { $in: colorIds };
  }

  if (sizeIds.length) {
    variantElem.sizeId = { $in: sizeIds };
  }

  if (Object.keys(variantElem).length) {
    // Keep only products that have a matching variant
    pipeline.push({
      $match: {
        variants: { $elemMatch: variantElem },
      },
    });

    // Filter variants array to only matching ones
    const conds: any[] = [];

    if (colorIds.length) {
      conds.push({ $in: ["$$v.colorId", colorIds] });
    }

    if (sizeIds.length) {
      conds.push({ $in: ["$$v.sizeId", sizeIds] });
    }

    pipeline.push({
      $set: {
        variants: {
          $filter: {
            input: "$variants",
            as: "v",
            cond: conds.length === 1 ? conds[0] : { $and: conds },
          },
        },
      },
    });
  }

  // 3. Attach images
  pipeline.push({
    $lookup: {
      from: "productimages",
      localField: "_id",
      foreignField: "productId",
      as: "images",
    },
  });

  // 4. Attach category
  pipeline.push({
    $lookup: {
      from: "categories",
      localField: "categoryId",
      foreignField: "_id",
      as: "category",
    },
  });

  // 5. Attach gender
  pipeline.push({
    $lookup: {
      from: "genders",
      localField: "genderId",
      foreignField: "_id",
      as: "gender",
    },
  });

  // 6. Flatten category & gender
  pipeline.push(
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$gender",
        preserveNullAndEmptyArrays: true,
      },
    },
  );

  // 7. Compute useful fields
  pipeline.push({
    $addFields: {
      totalStock: {
        $sum: "$variants.inStock",
      },
      basePrice: {
        $min: {
          $map: {
            input: "$variants",
            as: "v",
            in: "$$v.price",
          },
        },
      },
    },
  });

  // 8. Sorting
  pipeline.push({
    $sort: sort,
  });

  // 9. Pagination
  pipeline.push({ $skip: skip }, { $limit: limit });

  // 10. Final shape (RAW DB shape, not UI shape)
  pipeline.push({
    $project: {
      name: 1,
      slug: 1,
      isPublished: 1,
      createdAt: 1,
      updatedAt: 1,

      category: 1,
      gender: 1,
      images: 1,
      variants: 1,

      totalStock: 1,
      basePrice: 1,
    },
  });

  const result = await Product.aggregate(pipeline);

  return result;
}

export async function findProductBySlugRepo(slug: string) {
  await connectMongoDB();

  const result = await Product.aggregate([
    // 1. Match product
    {
      $match: {
        slug,
        isPublished: true,
      },
    },

    // 2. Variants
    {
      $lookup: {
        from: "productvariants",
        localField: "_id",
        foreignField: "productId",
        as: "variants",
      },
    },

    // 🔥 2.1 Unwind variants (so we can populate inside)
    {
      $unwind: {
        path: "$variants",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 🔥 2.2 Lookup color
    {
      $lookup: {
        from: "colors",
        localField: "variants.colorId",
        foreignField: "_id",
        as: "variants.colorId",
      },
    },

    // 🔥 2.3 Lookup size
    {
      $lookup: {
        from: "sizes",
        localField: "variants.sizeId",
        foreignField: "_id",
        as: "variants.sizeId",
      },
    },

    // 🔥 2.4 Flatten color + size arrays
    {
      $set: {
        "variants.colorId": { $arrayElemAt: ["$variants.colorId", 0] },
        "variants.sizeId": { $arrayElemAt: ["$variants.sizeId", 0] },
      },
    },

    // 🔥 2.5 Re-group variants back into array
    {
      $group: {
        _id: "$_id",
        doc: { $first: "$$ROOT" },
        variants: { $push: "$variants" },
      },
    },

    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$doc", { variants: "$variants" }],
        },
      },
    },

    // 3. Images
    {
      $lookup: {
        from: "productimages",
        localField: "_id",
        foreignField: "productId",
        as: "images",
      },
    },

    // 4. Category
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },

    // 5. Gender
    {
      $lookup: {
        from: "genders",
        localField: "genderId",
        foreignField: "_id",
        as: "gender",
      },
    },

    // 6. Flatten
    {
      $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$gender", preserveNullAndEmptyArrays: true },
    },

    // 7. Derived fields
    {
      $addFields: {
        basePrice: {
          $min: {
            $map: {
              input: "$variants",
              as: "v",
              in: "$$v.price",
            },
          },
        },

        salePrice: {
          $min: {
            $map: {
              input: "$variants",
              as: "v",
              in: "$$v.salePrice",
            },
          },
        },
      },
    },

    // 8. Shape output
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,

        category: 1,
        gender: 1,

        variants: 1,
        images: 1,

        basePrice: 1,
        salePrice: 1,
      },
    },
  ]);

  return result[0] || null;
}

export async function findRecommendedProductsRepo({
  type = "trending",
  productId,
  categoryId,
  genderId,
  limit = 4,
}: GetRecommendedParams) {
  await connectMongoDB();

  const currentId = productId ? new mongoose.Types.ObjectId(productId) : null;

  const match: Record<string, any> = {
    isPublished: true,
  };

  // ✅ related filter
  if (type === "related") {
    if (!categoryId || !genderId) return [];

    match.categoryId = new mongoose.Types.ObjectId(categoryId);
    match.genderId = new mongoose.Types.ObjectId(genderId);
  }

  const sortStage: Record<string, 1 | -1> =
    type === "trending" ? { createdAt: -1 } : { _id: 1 };

  const pipeline: PipelineStage[] = [
    {
      $match: {
        ...match,
        ...(currentId && { _id: { $ne: currentId } }),
      },
    },

    // -------------------------
    // VARIANTS
    // -------------------------
    {
      $lookup: {
        from: "productvariants",
        localField: "_id",
        foreignField: "productId",
        as: "variants",
      },
    },

    // -------------------------
    // PRIMARY IMAGE (FIXED)
    // -------------------------
    {
      $lookup: {
        from: "productimages",
        let: { pid: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$productId", "$$pid"] },
            },
          },
          { $sort: { isPrimary: -1, sortOrder: 1 } },
          { $limit: 1 },
        ],
        as: "primaryImage",
      },
    },
    {
      $set: {
        primaryImage: { $arrayElemAt: ["$primaryImage", 0] },
      },
    },

    // -------------------------
    // CATEGORY + GENDER
    // -------------------------
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $lookup: {
        from: "genders",
        localField: "genderId",
        foreignField: "_id",
        as: "gender",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$gender", preserveNullAndEmptyArrays: true } },

    // -------------------------
    // PRICE CALCULATION
    // -------------------------
    {
      $addFields: {
        price: { $min: "$variants.price" },
        salePrice: { $min: "$variants.salePrice" },
      },
    },

    // -------------------------
    // COLORS (FIXED)
    // -------------------------
    {
      $addFields: {
        variantColorIds: {
          $setUnion: [
            {
              $map: {
                input: "$variants",
                as: "v",
                in: "$$v.colorId",
              },
            },
            [],
          ],
        },
      },
    },
    {
      $lookup: {
        from: "colors",
        localField: "variantColorIds",
        foreignField: "_id",
        as: "variantColors",
      },
    },

    // -------------------------
    // QUICK ADD (OPTIONAL BUT GOOD)
    // -------------------------
    {
      $set: {
        quickAddRaw: {
          $arrayElemAt: ["$variants", 0],
        },
      },
    },
    {
      $lookup: {
        from: "colors",
        localField: "quickAddRaw.colorId",
        foreignField: "_id",
        as: "quickAddColor",
      },
    },
    {
      $lookup: {
        from: "sizes",
        localField: "quickAddRaw.sizeId",
        foreignField: "_id",
        as: "quickAddSize",
      },
    },
    {
      $set: {
        quickAddColor: { $arrayElemAt: ["$quickAddColor", 0] },
        quickAddSize: { $arrayElemAt: ["$quickAddSize", 0] },
      },
    },

    // -------------------------
    // SORT + LIMIT
    // -------------------------
    { $sort: sortStage },
    { $limit: limit },

    // -------------------------
    // FINAL SHAPE
    // -------------------------
    {
      $project: {
        name: 1,
        slug: 1,
        price: 1,
        salePrice: 1,

        primaryImage: 1,
        variantColors: {
          name: 1,
          slug: 1,
          hexCode: 1,
        },

        quickAddRaw: 1,
        quickAddColor: {
          name: 1,
          hexCode: 1,
        },
        quickAddSize: {
          name: 1,
        },

        category: {
          name: "$category.name",
          slug: "$category.slug",
        },

        gender: {
          label: "$gender.label",
          slug: "$gender.slug",
        },
      },
    },
  ];

  return Product.aggregate(pipeline);
}

export async function findAdminProductsRepo() {
  await connectMongoDB();

  const pipeline: PipelineStage[] = [
    {
      $match: { isPublished: true },
    },

    // 🔗 Variants
    {
      $lookup: {
        from: "productvariants",
        localField: "_id",
        foreignField: "productId",
        as: "variants",
      },
    },

    // 🖼 Images
    {
      $lookup: {
        from: "productimages",
        localField: "_id",
        foreignField: "productId",
        as: "images",
      },
    },

    // 📦 Category
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },

    // 👤 Gender
    {
      $lookup: {
        from: "genders",
        localField: "genderId",
        foreignField: "_id",
        as: "gender",
      },
    },

    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$gender", preserveNullAndEmptyArrays: true } },

    // 📊 Derived fields
    {
      $addFields: {
        variantCount: { $size: "$variants" },
        imageCount: { $size: "$images" },

        totalStock: {
          $sum: "$variants.inStock",
        },

        minPrice: { $min: "$variants.price" },
        maxPrice: { $max: "$variants.price" },

        minSalePrice: { $min: "$variants.salePrice" },
      },
    },

    // 🎯 Primary Image
    {
      $addFields: {
        primaryImage: {
          $first: {
            $filter: {
              input: "$images",
              as: "img",
              cond: { $eq: ["$$img.isPrimary", true] },
            },
          },
        },
      },
    },

    // 🧹 Final shape
    {
      $project: {
        name: 1,
        slug: 1,
        createdAt: 1,

        category: {
          name: "$category.name",
          slug: "$category.slug",
        },

        gender: {
          label: "$gender.label",
          slug: "$gender.slug",
        },

        variantCount: 1,
        imageCount: 1,
        totalStock: 1,

        minPrice: 1,
        maxPrice: 1,

        isOnSale: {
          $cond: [
            {
              $and: [
                { $ne: ["$minSalePrice", null] },
                { $lt: ["$minSalePrice", "$minPrice"] },
              ],
            },
            true,
            false,
          ],
        },

        primaryImageUrl: "$primaryImage.url",
      },
    },

    { $sort: { createdAt: -1 } },
  ];

  return Product.aggregate(pipeline);
}
