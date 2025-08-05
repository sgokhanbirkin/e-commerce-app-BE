import { db } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function registerUser(email: string, password: string) {
  const hash = await bcrypt.hash(password, 10);
  return db.user.create({ data: { email, passwordHash: hash } });
}

export async function loginUser(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("Invalid credentials");
  }
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
}
