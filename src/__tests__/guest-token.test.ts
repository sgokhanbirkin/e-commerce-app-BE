import request from "supertest";
import { app } from "../main";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

describe("Guest Token API", () => {
  describe("POST /api/auth/guest", () => {
    it("should create guest token successfully", async () => {
      const response = await request(app)
        .post("/api/auth/guest")
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    it("should return different tokens for multiple requests", async () => {
      const response1 = await request(app)
        .post("/api/auth/guest")
        .set("Content-Type", "application/json");

      const response2 = await request(app)
        .post("/api/auth/guest")
        .set("Content-Type", "application/json");

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.token).not.toBe(response2.body.token);
    });

    it("should create valid JWT tokens", async () => {
      const response = await request(app)
        .post("/api/auth/guest")
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);

      const token = response.body.token;

      // Verify the token is a valid JWT
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      expect(decoded).toHaveProperty("guestId");
      expect(decoded).toHaveProperty("type");
      expect(decoded).toHaveProperty("iat");
      expect(decoded).toHaveProperty("exp");
      expect(decoded.type).toBe("guest");
      expect(typeof decoded.guestId).toBe("string");
      expect(decoded.guestId.length).toBeGreaterThan(0);
    });

    it("should create tokens with 7 day expiration", async () => {
      const response = await request(app)
        .post("/api/auth/guest")
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);

      const token = response.body.token;
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + 7 * 24 * 60 * 60; // 7 days

      // Allow for a small time difference (within 5 seconds)
      expect(Math.abs(decoded.exp - expectedExp)).toBeLessThan(5);
    });

    it("should not require authentication", async () => {
      const response = await request(app)
        .post("/api/auth/guest")
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
    });

    it("should work without Content-Type header", async () => {
      const response = await request(app).post("/api/auth/guest");

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
    });

    it("should ignore request body", async () => {
      const response = await request(app)
        .post("/api/auth/guest")
        .set("Content-Type", "application/json")
        .send({ someData: "should be ignored" });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
    });
  });
});
