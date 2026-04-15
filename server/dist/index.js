"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const product_1 = require("./lib/validations/product");
const customer_1 = require("./lib/validations/customer");
const order_1 = require("./lib/validations/order");
const lock_service_1 = require("./services/lock-service");
const report_service_1 = require("./services/report-service");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// Initialize daily jobs
(0, lock_service_1.initScheduledJobs)();
// --- Products API ---
app.get("/api/products", async (req, res) => {
    const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
    res.json(products);
});
app.post("/api/products", async (req, res) => {
    try {
        const data = product_1.productSchema.parse(req.body);
        const product = await prisma.product.create({ data });
        res.status(201).json(product);
    }
    catch (err) {
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
        const data = customer_1.customerSchema.parse(req.body);
        const customer = await prisma.customer.create({ data });
        res.status(201).json(customer);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// --- Orders API ---
app.get("/api/orders", async (req, res) => {
    const { date } = req.query;
    const d = date ? new Date(date) : new Date();
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
        const data = order_1.orderSchema.parse(req.body);
        const totalPrice = data.items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);
        // Check if it's a late addition
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
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// --- Admin API ---
app.post("/api/admin/lock-today", async (req, res) => {
    await (0, lock_service_1.lockDailyOrders)();
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
// --- Reports API ---
app.get("/api/reports/picking", async (req, res) => {
    const { date } = req.query;
    if (!date)
        return res.status(400).json({ error: "Date is required" });
    const summary = await (0, report_service_1.getPickingSummary)(date);
    res.json(summary);
});
app.listen(PORT, () => {
    console.log(`🚀 RouteFlow API running on http://localhost:${PORT}`);
});
