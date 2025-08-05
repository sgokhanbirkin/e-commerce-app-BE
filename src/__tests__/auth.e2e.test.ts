import request from "supertest";
import { app } from "../main";

describe("Auth Endpoints", () => {
  const testUser = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
    phone: "1234567890",
  };

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("email", testUser.email);
      expect(res.body).toHaveProperty("name", testUser.name);
    });

    it("should return 400 for invalid data", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "invalid-email" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should return 400 for invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.status).toBe(400);
    });
  });
});
