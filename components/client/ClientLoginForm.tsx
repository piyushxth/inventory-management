"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ZodFormattedError } from "zod";
import { TUserLogin, UserLoginSchema } from "@/libs/zod_schema/user";

type LoginErrors = ZodFormattedError<TUserLogin, string>;

const ClientLoginForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<TUserLogin>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginErrors | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prevErrors) => {
      // Ensure previous errors exist
      if (!prevErrors) {
        return null;
      }

      // Return updated errors object with cleared errors for the current field
      return {
        ...prevErrors,
        [name]: { _errors: [] }, // Clear errors for the current field
      } as LoginErrors;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data using Zod schema
    const result = UserLoginSchema.safeParse(formData);

    if (!result.success) {
      setErrors(result.error.format());
      return;
    }

    try {
      // Attempt to sign in using NextAuth's credentials provider
      const response = await signIn("credentials", {
        email: result.data.email,
        password: result.data.password,
        redirect: false, // Do not automatically redirect
        callbackUrl: "/",
      });

      if (response?.error) {
        console.log("SignIn error:", response.error);
        setFormError(response.error);
        setSuccess(null);
      } else {
        setSuccess("Login successful!");
        setFormError(null);
        // Redirect to home page for clients
        router.push("/");
      }
    } catch (error) {
      // Type-checking `error` as unknown
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("An unexpected error occurred");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white text-black p-5 shadow-md rounded-lg"
    >
      <h2 className="text-2xl font-bold text-center mb-6">Customer Login</h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="your.email@example.com"
        />
        {errors?.email?._errors?.[0] && (
          <p className="text-red-500 text-sm">{errors.email._errors[0]}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="••••••••"
        />
        {errors?.password?._errors?.[0] && (
          <p className="text-red-500 text-sm">{errors.password._errors[0]}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Login
      </button>

      {formError && (
        <p className="text-red-600 text-center mt-4">{formError}</p>
      )}
      {success && <p className="text-green-600 text-center mt-4">{success}</p>}
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/auth/client/signup" className="text-green-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </form>
  );
};

export default ClientLoginForm;