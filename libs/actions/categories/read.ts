"use server";

import { Category } from "@/libs/models";
import { CategoryType } from "@/libs/products.types";
import mongoose from "mongoose";

export async function getCategories(): Promise<CategoryType[]> {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();

    return categories.map((category) => ({
      id: (category._id as mongoose.Types.ObjectId).toString(),
      name: category.name,
      slug: category.slug,
      parentId: category.parentId
        ? (category.parentId as mongoose.Types.ObjectId).toString()
        : null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryType | null> {
  try {
    const category = await Category.findOne({ slug }).lean();

    if (!category) return null;

    return {
      id: (category._id as mongoose.Types.ObjectId).toString(),
      name: category.name,
      slug: category.slug,
      parentId: category.parentId
        ? (category.parentId as mongoose.Types.ObjectId).toString()
        : null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
}

export async function getCategoryById(
  id: string,
): Promise<CategoryType | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const category = await Category.findById(id).lean();

    if (!category) return null;

    return {
      id: (category._id as mongoose.Types.ObjectId).toString(),
      name: category.name,
      slug: category.slug,
      parentId: category.parentId
        ? (category.parentId as mongoose.Types.ObjectId).toString()
        : null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
}

export async function getParentCategories(): Promise<CategoryType[]> {
  try {
    const categories = await Category.find({
      parentId: null,
    })
      .sort({ name: 1 })
      .lean();

    return categories.map((category) => ({
      id: (category._id as mongoose.Types.ObjectId).toString(),
      name: category.name,
      slug: category.slug,
      parentId: null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  } catch (error) {
    console.error("Failed to fetch parent categories:", error);
    return [];
  }
}
