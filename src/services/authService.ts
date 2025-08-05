import { db } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function registerUser(
  email: string,
  password: string,
  name?: string,
  phone?: string,
  address?: any
) {
  const hash = await bcrypt.hash(password, 10);

  // Address validation - tüm gerekli field'lar var mı kontrol et
  const hasValidAddress =
    address &&
    address.label &&
    address.line1 &&
    address.city &&
    address.postal &&
    address.country;

  const user = await db.user.create({
    data: {
      email,
      passwordHash: hash,
      name,
      phone,
      addresses: hasValidAddress
        ? {
            create: address,
          }
        : undefined,
    },
    include: {
      addresses: true,
    },
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("Invalid credentials");
  }
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
}

export async function getUserProfile(userId: number) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      addresses: true,
    },
  });
}

export async function addUserAddress(userId: number, addressData: any) {
  return db.address.create({
    data: {
      ...addressData,
      userId,
    },
  });
}
