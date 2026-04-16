import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { productSchema } from "./lib/validations/product";
import { customerSchema } from "./lib/validations/customer";
import { orderSchema } from "./lib/validations/order";
import { initScheduledJobs, lockDailyOrders } from "./services/lock-service";
import { getPickingSummary } from "./services/report-service";
import { generateRouteReminder } from "./services/notification-service";
import { getActiveAlerts } from "./services/alert-service";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Initialize daily jobs
initScheduledJobs();

// --- Products API ---
app.get("/api/products", async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  res.json(products);
});

app.post("/api/products", async (req, res) => {
  try {
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({ data });
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Customers API ---
app.get("/api/customers", async (req, res) => {
  const customers = await prisma.customer.findMany({ include: { route: true }, orderBy: { name: "asc" } });
  res.json(customers);
});

app.post("/api/customers", async (req, res) => {
  try {
    const data = customerSchema.parse(req.body);
    const customer = await prisma.customer.create({ data });
    res.status(201).json(customer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Orders API ---
app.get("/api/orders", async (req, res) => {
  const { date } = req.query;
  const d = date ? new Date(date as string) : new Date();
  const startOfDay = new Date(d.setHours(0, 0, 0, 0));
  const endOfDay = new Date(d.setHours(23, 59, 59, 999));

  const orders = await prisma.order.findMany({
    where: { deliveryDate: { gte: startOfDay, lte: endOfDay } },
    include: { customer: { include: { route: true } }, items: { include: { product: true } } },
  });
  res.json(orders);
});

app.post("/api/orders", async (req, res) => {
  try {
    const data = orderSchema.parse(req.body);
    const totalPrice = data.items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);
    
    const deliveryDate = new Date(data.deliveryDate);
    const now = new Date();
    const isToday = deliveryDate.toDateString() === now.toDateString();
    const isAfterLock = now.getHours() >= 14;
    const isLateAddition = isToday && isAfterLock;

    const order = await prisma.order.create({
      data: {
        customerId: data.customerId,
        deliveryDate: deliveryDate,
        type: data.type,
        status: isLateAddition ? "LOCKED" : "DRAFT",
        isLateAddition: isLateAddition,
        totalPrice,
        createdBy: "system", 
        items: {
          create: data.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
    });
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Admin API ---
app.post("/api/admin/lock-today", async (req, res) => {
  await lockDailyOrders();
  res.json({ success: true, message: "Orders locked manually" });
});

// --- Routes API ---
app.get("/api/routes", async (req, res) => {
  const routes = await prisma.route.findMany({
    include: {
      driver: { select: { name: true } },
      _count: { select: { customers: true } },
    },
  });
  res.json(routes);
});

app.get("/api/routes/:id/reminder", async (req, res) => {
  try {
    const reminder = await generateRouteReminder(req.params.id);
    res.json(reminder);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// --- Alerts API ---
app.get("/api/alerts", async (req, res) => {
  const alerts = await getActiveAlerts();
  res.json(alerts);
});

// --- Reports API ---
app.get("/api/reports/picking", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Date is required" });
  const summary = await getPickingSummary(date as string);
  res.json(summary);
});

app.listen(PORT, () => {
  console.log(`🚀 RouteFlow API running on http://localhost:${PORT}`);
});

export { app, prisma };
