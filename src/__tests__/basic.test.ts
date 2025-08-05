import request from "supertest";
import { app } from "../main";

describe("Basic API Tests", () => {
  it("should return health check", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });
});
