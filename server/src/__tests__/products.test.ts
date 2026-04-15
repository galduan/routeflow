import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app, prisma } from "../index";

describe("Products API", () => {
  it("GET /api/products returns an array", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/products creates a new product", async () => {
    const sku = `TEST-${Date.now()}`;
    const res = await request(app)
      .post("/api/products")
      .send({
        sku,
        name: "Test Egg",
        category: "Fresh",
        unit: "Tray",
        price: 15.5,
        isActive: true
      });
    
    expect(res.status).toBe(201);
    expect(res.body.sku).toBe(sku);
  });
});
