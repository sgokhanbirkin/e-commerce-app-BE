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
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      addresses: true,
    },
  });

  if (!user) {
    return null;
  }

  // Split the name into firstName and lastName, handling extra spaces
  const nameParts = user.name ? user.name.trim().split(/\s+/) : [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Return in the expected format
  return {
    id: user.id.toString(),
    email: user.email,
    firstName: firstName,
    lastName: lastName,
    avatar: user.avatarUrl || null,
    phone: user.phone || null,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
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

export async function updateUserProfile(
  userId: number,
  updateData: {
    name?: string;
    email?: string;
    phone?: string;
  }
) {
  // Check if email is being updated and if it's already taken by another user
  if (updateData.email) {
    const existingUser = await db.user.findFirst({
      where: {
        email: updateData.email,
        id: { not: userId },
      },
    });
    if (existingUser) {
      throw new Error("Email already exists");
    }
  }

  return db.user.update({
    where: { id: userId },
    data: updateData,
    include: {
      addresses: true,
    },
  });
}

export async function updateUserProfileWithDetails(
  userId: number,
  updateData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
  }
) {
  // Combine firstName and lastName into name field
  let name = undefined;
  if (updateData.firstName !== undefined || updateData.lastName !== undefined) {
    const currentUser = await db.user.findUnique({
      where: { id: userId },
    });

    const currentNameParts = currentUser?.name
      ? currentUser.name.trim().split(/\s+/)
      : [];
    const currentFirstName = currentNameParts[0] || "";
    const currentLastName = currentNameParts.slice(1).join(" ") || "";

    const newFirstName =
      updateData.firstName !== undefined
        ? updateData.firstName
        : currentFirstName;
    const newLastName =
      updateData.lastName !== undefined ? updateData.lastName : currentLastName;

    name = `${newFirstName} ${newLastName}`.trim();
  }

  // Parse dateOfBirth if provided
  let dateOfBirth = undefined;
  if (updateData.dateOfBirth) {
    dateOfBirth = new Date(updateData.dateOfBirth);
  }

  const updateFields: any = {};
  if (name !== undefined) updateFields.name = name;
  if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
  if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth;

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: updateFields,
    include: {
      addresses: true,
    },
  });

  // Split the name into firstName and lastName for response
  const nameParts = updatedUser.name
    ? updatedUser.name.trim().split(/\s+/)
    : [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    id: updatedUser.id.toString(),
    email: updatedUser.email,
    firstName: firstName,
    lastName: lastName,
    avatar: updatedUser.avatarUrl || null,
    phone: updatedUser.phone || null,
    dateOfBirth: updatedUser.dateOfBirth
      ? updatedUser.dateOfBirth.toISOString()
      : null,
    updatedAt: updatedUser.updatedAt.toISOString(),
  };
}

export async function updateUserPassword(
  userId: number,
  currentPassword: string,
  newPassword: string
) {
  // Get user with current password hash
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!isCurrentPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  await db.user.update({
    where: { id: userId },
    data: {
      passwordHash: newPasswordHash,
    },
  });

  return { message: "Password updated successfully" };
}

export async function updateUserAvatar(userId: number, avatarUrl: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Update avatar URL
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      avatarUrl,
    },
    include: {
      addresses: true,
    },
  });

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    avatar: updatedUser.avatarUrl,
    createdAt: updatedUser.createdAt,
  };
}

export async function updateUserAddress(
  userId: number,
  addressId: number,
  addressData: {
    label?: string;
    line1?: string;
    line2?: string;
    city?: string;
    postal?: string;
    country?: string;
    phone?: string;
  }
) {
  // First check if the address belongs to the user
  const address = await db.address.findFirst({
    where: {
      id: addressId,
      userId: userId,
    },
  });

  if (!address) {
    throw new Error("Address not found or does not belong to user");
  }

  // Filter out undefined values for partial updates
  const updateData = Object.fromEntries(
    Object.entries(addressData).filter(([_, value]) => value !== undefined)
  );

  // Update the address
  const updatedAddress = await db.address.update({
    where: { id: addressId },
    data: updateData,
  });

  return {
    id: updatedAddress.id,
    label: updatedAddress.label,
    line1: updatedAddress.line1,
    line2: updatedAddress.line2,
    city: updatedAddress.city,
    postal: updatedAddress.postal,
    country: updatedAddress.country,
    phone: updatedAddress.phone,
    userId: updatedAddress.userId,
  };
}

export async function deleteUserAddress(userId: number, addressId: number) {
  // First check if the address belongs to the user
  const address = await db.address.findFirst({
    where: {
      id: addressId,
      userId: userId,
    },
  });

  if (!address) {
    throw new Error("Address not found or does not belong to user");
  }

  // Delete the address
  await db.address.delete({
    where: { id: addressId },
  });

  return { message: "Adres başarıyla silindi" };
}
