import { z } from "zod";

export const eoriNumber = z
  .string()
  .min(1, "EORI number is required.")
  .max(20);

export const address = z.string().min(1, "Address is required.").max(500);

export const phone = z.string().min(1, "Phone number is required.").max(30);

export const country = z.string().min(1, "Country is required.").max(100);
