"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ZodFormattedError } from "zod";
import { TUserCreate, UserCreateSchema } from "@/libs/zod_schema/user";

type SignupErrors = ZodFormattedError<TUserCreate, string>;

const ClientSignupForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<SignupErrors | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      } as SignupErrors;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setSuccess(null);

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate form data using Zod schema
    const result = UserCreateSchema.omit({ 
      profilePicture: true, 
      roles: true, 
      address: true 
    }).safeParse({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (!result.success) {
      setErrors(result.error.format());
      setLoading(false);
      return;
    }

    try {
      // Attempt to create user via API
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: result.data.name,
          email: result.data.email,
          password: result.data.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setFormError(data.message || "Failed to create account");
      } else {
        setSuccess("Account created successfully! Redirecting to login...");
        // Redirect to login page after successful signup
        setTimeout(() => {
          router.push("/auth/client/login");
        }, 2000);
      }
    } catch (error) {
      // Type-checking `error` as unknown
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white text-black p-5 shadow-md rounded-lg"
    >
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="John Doe"
        />
        {errors?.name?._errors?.[0] && (
          <p className="text-red-500 text-sm">{errors.name._errors[0]}</p>
        )}
      </div>

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

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Creating Account..." : "Sign Up"}
      </button>

      {formError && (
        <p className="text-red-600 text-center mt-4">{formError}</p>
      )}
      {success && <p className="text-green-600 text-center mt-4">{success}</p>}
    </form>
  );
};

export default ClientSignupForm;