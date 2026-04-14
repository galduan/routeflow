import * as z from "zod";

export const routeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  driverId: z.string().optional().nullable(),
  activityDays: z.array(z.number().min(0).max(6)).min(1, "Select at least one activity day"),
});

export type RouteInput = z.infer<typeof routeSchema>;
