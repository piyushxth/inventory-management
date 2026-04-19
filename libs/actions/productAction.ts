import connectMongoDB from "../connnectMongoDB";
import { Product } from "../models/product";
import { registerModels } from "../registerModels";

export async function getProducts({
  limit,
  sortBy,
  categoryId,
}: {
  limit?: number;
  sortBy?: any;
  categoryId?: string;
} = {}) {
  registerModels();
  await connectMongoDB();

  let query: any = {};
  if (categoryId) query.category = categoryId;

  let dbQuery = Product.find(query)
    .populate("category", "name")
    .populate("variants");

  if (sortBy) dbQuery = dbQuery.sort(sortBy);
  if (limit) dbQuery = dbQuery.limit(limit);

  const products = await dbQuery.lean();

  return JSON.parse(JSON.stringify(products)); // safe for client
}
