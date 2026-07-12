import { z } from "zod";

export const eoriNumber = z
  .string()
  .min(1, "EORI number is required.")
  .max(20);

export const street = z.string().min(1, "Street is required.").max(200);

export const city = z.string().min(1, "City is required.").max(100);

export const postalCode = z.string().min(1, "Postal code is required.").max(20);

export const phone = z.string().max(30);

export const country = z.string().min(1, "Country is required.").max(100);
