import { z } from "zod";

// Full admin-facing user schema (can include roles, profilePicture, address).
export const UserCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profilePicture: z.string().nullable().optional(),
  roles: z.string().min(1, "Role is required"),
  address: z.string().optional(),
});

// Public signup — client cannot set roles/profilePicture/address.
export const UserSignupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const UserUpdateSchema = UserCreateSchema.partial().extend({
  password: z.string().min(6).optional(),
});

export const UserLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type TUserCreate = z.infer<typeof UserCreateSchema>;
export type TUserSignup = z.infer<typeof UserSignupSchema>;
export type TUserUpdate = z.infer<typeof UserUpdateSchema>;
export type TUserLogin = z.infer<typeof UserLoginSchema>;
