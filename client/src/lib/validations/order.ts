import * as z from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unitPrice: z.number().nonnegative(),
});

export const orderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  deliveryDate: z.string().or(z.date()), 
  type: z.enum(["REGULAR", "FUTURE", "RECURRING", "SPECIAL"]),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
