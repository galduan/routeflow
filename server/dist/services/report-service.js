"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPickingSummary = getPickingSummary;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getPickingSummary(dateStr) {
    const date = new Date(dateStr);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    // Fetch all items for the given day
    const items = await prisma.orderItem.findMany({
        where: {
            order: {
                deliveryDate: { gte: startOfDay, lte: endOfDay },
                status: { not: "CANCELLED" },
            },
        },
        include: {
            product: true,
            order: {
                include: {
                    customer: {
                        include: { route: true },
                    },
                },
            },
        },
    });
    // Aggregate by Route and Product
    const summary = {
        grandTotal: {}, // { productId: { name, unit, total } }
        byRoute: {}, // { routeId: { routeName, products: { productId: { name, unit, total } } } }
    };
    items.forEach((item) => {
        const route = item.order.customer.route;
        const routeId = route?.id || "unassigned";
        const routeName = route?.name || "Unassigned";
        const productId = item.productId;
        const qty = Number(item.quantity);
        // 1. Grand Total
        if (!summary.grandTotal[productId]) {
            summary.grandTotal[productId] = { name: item.product.name, unit: item.product.unit, total: 0 };
        }
        summary.grandTotal[productId].total += qty;
        // 2. By Route
        if (!summary.byRoute[routeId]) {
            summary.byRoute[routeId] = { name: routeName, products: {} };
        }
        if (!summary.byRoute[routeId].products[productId]) {
            summary.byRoute[routeId].products[productId] = { name: item.product.name, unit: item.product.unit, total: 0 };
        }
        summary.byRoute[routeId].products[productId].total += qty;
    });
    return summary;
}
