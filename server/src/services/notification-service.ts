import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateRouteReminder(routeId: string) {
  const route = await prisma.route.findUnique({
    where: { id: routeId },
    include: {
      customers: {
        where: { isActive: true },
        orderBy: { sequenceOrder: "asc" },
      },
    },
  });

  if (!route) throw new Error("Route not found");

  // Format: "Morning! 🚚 Tomorrow's Route: [Route Name]. Orders needed by 14:00 today."
  const message = `Morning! 🚚 Reminder for Route: *${route.name}*.\nPlease place your orders by 14:00 today for tomorrow's delivery. Thank you!`;

  return {
    message,
    recipients: route.customers.map(c => ({
      name: c.name,
      phone: c.phone
    }))
  };
}
