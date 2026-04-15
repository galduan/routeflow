"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
(0, vitest_1.describe)("Products API", () => {
    (0, vitest_1.it)("GET /api/products returns an array", async () => {
        const res = await (0, supertest_1.default)(index_1.app).get("/api/products");
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(Array.isArray(res.body)).toBe(true);
    });
    (0, vitest_1.it)("POST /api/products creates a new product", async () => {
        const sku = `TEST-${Date.now()}`;
        const res = await (0, supertest_1.default)(index_1.app)
            .post("/api/products")
            .send({
            sku,
            name: "Test Egg",
            category: "Fresh",
            unit: "Tray",
            price: 15.5,
            isActive: true
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.sku).toBe(sku);
    });
});
