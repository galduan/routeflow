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
  // ... existing code ...

  // 3. Ghost Orders Alert: Orders today with no route
  const startOfToday = new Date();
  startOfToday.setHours(0,0,0,0);
  const ghostOrders = await prisma.order.findMany({
    where: {
      deliveryDate: { gte: startOfToday },
      customer: { routeId: null }
    },
    include: { customer: true }
  });

  ghostOrders.forEach(o => {
    alerts.push({
      type: "GHOST_ORDER",
      severity: "CRITICAL",
      customerId: o.customerId,
      customerName: o.customer.name,
      message: "Order placed for today but customer is not assigned to any route!"
    });
  });

  return alerts;
}
