import { PrismaClient } from "@prisma/client";
import { subDays, subWeeks } from "date-fns";

const prisma = new PrismaClient();

export async function getActiveAlerts() {
  const alerts: any[] = [];
  const fourteenDaysAgo = subDays(new Date(), 14);

  // 1. Inactivity Alert: No orders in 14 days
  const inactiveCustomers = await prisma.customer.findMany({
    where: {
      isActive: true,
      orders: {
        none: {
          deliveryDate: { gte: fourteenDaysAgo }
        }
      }
    }
  });

  inactiveCustomers.forEach(c => {
    alerts.push({
      type: "INACTIVITY",
      severity: "HIGH",
      customerId: c.id,
      customerName: c.name,
      message: "No orders placed in the last 14 days."
    });
  });

  // 2. Volume Drop Alert (Simplified for MVP)
  // Check customers who ordered last week but NOT this week
  const sevenDaysAgo = subDays(new Date(), 7);
  const volumeDropCustomers = await prisma.customer.findMany({
    where: {
      isActive: true,
      orders: {
        some: {
          deliveryDate: { gte: fourteenDaysAgo, lt: sevenDaysAgo }
        },
        none: {
          deliveryDate: { gte: sevenDaysAgo }
        }
      }
    }
  });

  volumeDropCustomers.forEach(c => {
    alerts.push({
      type: "VOLUME_DROP",
      severity: "MEDIUM",
      customerId: c.id,
      customerName: c.name,
      message: "Customer ordered last week but has zero orders this week."
    });
  });

  return alerts;
}
