import * as z from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  phone: z.string().min(1, "Phone is required"),
  contactPerson: z.string().optional().nullable(),
  routeId: z.string().min(1, "Route is required"),
  sequenceOrder: z.number().int().min(0),
  deliveryDays: z.array(z.number().min(0).max(6)).min(1, "Select at least one delivery day"),
  isActive: z.boolean().default(true),
});

export type CustomerInput = z.infer<typeof customerSchema>;
