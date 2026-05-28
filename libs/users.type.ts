export type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "user" | "admin";
  provider: "credentials" | "google";
  createdAt: string;
  updatedAt: string;
};
