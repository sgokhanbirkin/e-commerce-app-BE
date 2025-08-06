import { db } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

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

export async function createGuestToken() {
  const guestId = uuidv4();
  const token = jwt.sign(
    {
      guestId,
      type: "guest",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    guestId,
  };
}

export async function validateGuestToken(token: string) {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      guestId: string;
      type: string;
      userId?: number;
    };

    if (payload.type === "guest") {
      return { guestId: payload.guestId, type: "guest" };
    } else if (payload.userId) {
      return { userId: payload.userId, type: "user" };
    }

    return null;
  } catch {
    return null;
  }
}
