import { z } from "zod";

// Schema for the Login Page
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[@$!%*?&]/,
      "Password must contain at least one special character (@, $, !, %, *, ?, &)"
    ),
});

export const step1Schema = z
  .object({
    fullName: z.string().min(1, "Full name is required").min(4, "Full name must be at least 4 characters long"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character (@, $, !, %, *, ?, &)"
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const step2Schema = z.object({
  age: z
    .number({ invalid_type_error: "Age is required" })
    .min(18, "You must be at least 18 years old").max(120, "Age must be a realistic value"),
  gender: z.string().min(1, "Gender is required"),
  dob: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
});


export const step3Schema = z.object({
  profilePhoto: z
    .object({
      uri: z.string().min(1, "Profile photo is required"),
      name: z.string().min(1),
      type: z.enum(["image/jpeg", "image/png", "image/jpg", "image/webp"]),
    })
    .required(),
});
