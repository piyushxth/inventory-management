import { z } from "zod";

export const UserCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profilePicture: z.string().nullable().optional(),
  roles: z.string().min(1, "Role is required"), // Should be ObjectId as string
  address: z.string().optional(),
});

export const UserUpdateSchema = UserCreateSchema.partial().extend({
  password: z.string().min(6).optional(),
});

export const UserLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type TUserCreate = z.infer<typeof UserCreateSchema>;
export type TUserUpdate = z.infer<typeof UserUpdateSchema>;
export type TUserLogin = z.infer<typeof UserLoginSchema>;
