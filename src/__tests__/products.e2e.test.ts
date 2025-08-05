import request from "supertest";
import { app } from "../main";

describe("GET /api/products", () => {
  it("returns 200 and JSON array", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
