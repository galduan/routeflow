import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Locks all DRAFT orders for today.
 * Scheduled to run every day at 14:00.
 */
export async function lockDailyOrders() {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  console.log(`[LockService] Starting daily lock for ${today.toDateString()}...`);

  try {
    const result = await prisma.order.updateMany({
      where: {
        deliveryDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "DRAFT",
      },
      data: {
        status: "LOCKED",
      },
    });

    console.log(`[LockService] Successfully locked ${result.count} orders.`);
  } catch (error) {
    console.error("[LockService] Error during daily lock:", error);
  }
}

// Schedule the job: 0 14 * * * (At 14:00 every day)
export function initScheduledJobs() {
  cron.schedule("0 14 * * *", () => {
    lockDailyOrders();
  });
  console.log("[LockService] Daily lock job scheduled for 14:00.");
}
