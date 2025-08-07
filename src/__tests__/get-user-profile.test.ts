import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Get User Profile API", () => {
  let authToken: string;
  let userId: number;
  const testEmail = `testgetuserprofile${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create a test user with properly hashed password
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email: testEmail,
        passwordHash: hashedPassword,
        name: "John Doe",
        phone: "+90 555 123 4567",
      },
    });
    userId = user.id;

    // Login to get token
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "password123",
    });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await db.user.delete({
      where: { id: userId },
    });
  });

  it("should return user profile successfully", async () => {
    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: userId.toString(),
      email: testEmail,
      firstName: "John",
      lastName: "Doe",
      avatar: null,
    });
  });

  it("should handle user with single name", async () => {
    // Create another user with single name
    const singleNameEmail = `singlename${Date.now()}@example.com`;
    const singleNameUser = await db.user.create({
      data: {
        email: singleNameEmail,
        passwordHash: await bcrypt.hash("password123", 10),
        name: "Alice",
        phone: "+90 555 123 4567",
      },
    });

    // Login as single name user
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: singleNameEmail,
      password: "password123",
    });

    const singleNameToken = loginResponse.body.token;

    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${singleNameToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: singleNameUser.id.toString(),
      email: singleNameEmail,
      firstName: "Alice",
      lastName: "",
      avatar: null,
    });

    // Clean up single name user
    await db.user.delete({
      where: { id: singleNameUser.id },
    });
  });

  it("should handle user with no name", async () => {
    // Create another user with no name
    const noNameEmail = `noname${Date.now()}@example.com`;
    const noNameUser = await db.user.create({
      data: {
        email: noNameEmail,
        passwordHash: await bcrypt.hash("password123", 10),
        phone: "+90 555 123 4567",
      },
    });

    // Login as no name user
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: noNameEmail,
      password: "password123",
    });

    const noNameToken = loginResponse.body.token;

    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${noNameToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: noNameUser.id.toString(),
      email: noNameEmail,
      firstName: "",
      lastName: "",
      avatar: null,
    });

    // Clean up no name user
    await db.user.delete({
      where: { id: noNameUser.id },
    });
  });

  it("should handle user with avatar", async () => {
    // Create another user with avatar
    const avatarEmail = `avatar${Date.now()}@example.com`;
    const avatarUser = await db.user.create({
      data: {
        email: avatarEmail,
        passwordHash: await bcrypt.hash("password123", 10),
        name: "Avatar User",
        phone: "+90 555 123 4567",
        avatarUrl: "https://example.com/avatar.jpg",
      },
    });

    // Login as avatar user
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: avatarEmail,
      password: "password123",
    });

    const avatarToken = loginResponse.body.token;

    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${avatarToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: avatarUser.id.toString(),
      email: avatarEmail,
      firstName: "Avatar",
      lastName: "User",
      avatar: "https://example.com/avatar.jpg",
    });

    // Clean up avatar user
    await db.user.delete({
      where: { id: avatarUser.id },
    });
  });

  it("should return 401 without authorization", async () => {
    const response = await request(app).get("/api/users/me");

    expect(response.status).toBe(401);
  });

  it("should return 401 with invalid token", async () => {
    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
  });

  it("should return 401 with expired token", async () => {
    // Create a token that expires immediately
    const expiredToken = jwt.sign(
      { userId: userId },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "0s" }
    );

    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it("should handle user with multiple word names", async () => {
    // Create another user with multiple word names
    const multiNameEmail = `multiname${Date.now()}@example.com`;
    const multiNameUser = await db.user.create({
      data: {
        email: multiNameEmail,
        passwordHash: await bcrypt.hash("password123", 10),
        name: "Mary Jane Watson",
        phone: "+90 555 123 4567",
      },
    });

    // Login as multi name user
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: multiNameEmail,
      password: "password123",
    });

    const multiNameToken = loginResponse.body.token;

    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${multiNameToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: multiNameUser.id.toString(),
      email: multiNameEmail,
      firstName: "Mary",
      lastName: "Jane Watson",
      avatar: null,
    });

    // Clean up multi name user
    await db.user.delete({
      where: { id: multiNameUser.id },
    });
  });

  it("should handle user with extra spaces in name", async () => {
    // Create another user with extra spaces in name
    const spaceNameEmail = `spacename${Date.now()}@example.com`;
    const spaceNameUser = await db.user.create({
      data: {
        email: spaceNameEmail,
        passwordHash: await bcrypt.hash("password123", 10),
        name: "  John   Doe  ",
        phone: "+90 555 123 4567",
      },
    });

    // Login as space name user
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: spaceNameEmail,
      password: "password123",
    });

    const spaceNameToken = loginResponse.body.token;

    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${spaceNameToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: spaceNameUser.id.toString(),
      email: spaceNameEmail,
      firstName: "John",
      lastName: "Doe",
      avatar: null,
    });

    // Clean up space name user
    await db.user.delete({
      where: { id: spaceNameUser.id },
    });
  });
});
