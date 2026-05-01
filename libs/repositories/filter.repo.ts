import { Gender } from "@/libs/models/Gender";
import { Color } from "@/libs/models/Color";
import { Size } from "@/libs/models/Size";
import connectMongoDB from "../connnectMongoDB";
import { Category } from "../models";

export async function fetchFilterOptions() {
  await connectMongoDB();

  const [categories, genders, colors, sizes] = await Promise.all([
    Category.find().select("name slug parentId").lean(),
    Gender.find().select("label slug").lean(),
    Color.find().select("name slug hexCode").lean(),
    Size.find().select("name slug sortOrder").lean(),
  ]);
  console.log("Fetched filter options:", {
    categories,
    genders,
    colors,
    sizes,
  });

  return {
    categories,
    genders,
    colors,
    sizes,
  };
}
