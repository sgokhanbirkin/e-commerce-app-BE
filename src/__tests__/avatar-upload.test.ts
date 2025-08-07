import request from "supertest";
import { app } from "../main";
import { db } from "../db";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";

describe("Avatar Upload API", () => {
  let authToken: string;
  let userId: number;
  const testEmail = `testavatar${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create a test user with properly hashed password
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email: testEmail,
        passwordHash: hashedPassword,
        name: "Test User",
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
    // Clean up test user
    await db.user.delete({
      where: { id: userId },
    });
  });

  it("should upload avatar successfully", async () => {
    // Create a simple test image
    const testImagePath = path.join(__dirname, "test-avatar.png");
    const testImageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );
    fs.writeFileSync(testImagePath, testImageBuffer);

    const response = await request(app)
      .post("/api/auth/users/me/avatar")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", testImagePath);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: userId,
      name: "Test User",
      email: testEmail,
    });
    expect(response.body.avatar).toMatch(
      /^http:\/\/(localhost|127\.0\.0\.1):\d+\/avatars\/user-\d+-\d+-\d+\.png$/
    );

    // Clean up test file
    fs.unlinkSync(testImagePath);
  });

  it("should return 400 when no file is uploaded", async () => {
    const response = await request(app)
      .post("/api/auth/users/me/avatar")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("No file uploaded");
  });

  it("should return 400 when wrong field name is used", async () => {
    // Create a simple test image
    const testImagePath = path.join(__dirname, "test-avatar.png");
    const testImageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );
    fs.writeFileSync(testImagePath, testImageBuffer);

    const response = await request(app)
      .post("/api/auth/users/me/avatar")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("wrongfield", testImagePath);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("File upload error");

    // Clean up test file
    fs.unlinkSync(testImagePath);
  });

  it("should return 400 for non-image file", async () => {
    // Create a text file
    const testFilePath = path.join(__dirname, "test-file.txt");
    fs.writeFileSync(testFilePath, "This is not an image");

    const response = await request(app)
      .post("/api/auth/users/me/avatar")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", testFilePath);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Only image files are allowed");

    // Clean up test file
    fs.unlinkSync(testFilePath);
  });

  it("should return 401 without authorization", async () => {
    const response = await request(app).post("/api/auth/users/me/avatar");

    expect(response.status).toBe(401);
  });
});
