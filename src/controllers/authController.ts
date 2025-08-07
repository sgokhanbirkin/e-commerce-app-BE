import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  addUserAddress,
  createGuestToken,
  updateUserProfile,
  updateUserProfileWithDetails,
  updateUserPassword,
  updateUserAvatar,
  updateUserAddress,
  deleteUserAddress,
} from "../services/authService";

export const register = async (req: Request, res: Response) => {
  const { email, password, name, phone, address } = req.body;
  const user = await registerUser(email, password, name, phone, address);
  res.status(201).json({ id: user.id, email: user.email, name: user.name });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const token = await loginUser(email, password);
  res.json({ token });
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = await getUserProfile(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

export const addAddress = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const address = await addUserAddress(userId, req.body);
  res.status(201).json(address);
};

export const createGuest = async (req: Request, res: Response) => {
  const { token } = await createGuestToken();
  res.status(201).json({ token });
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { name, email, phone } = req.body;

  try {
    const updatedUser = await updateUserProfile(userId, { name, email, phone });
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      createdAt: updatedUser.createdAt,
    });
  } catch (error: any) {
    if (error.message === "Email already exists") {
      return res.status(400).json({ error: "Email already exists" });
    }
    throw error;
  }
};

export const updateProfileWithDetails = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { firstName, lastName, phone, dateOfBirth } = req.body;

  try {
    const updatedUser = await updateUserProfileWithDetails(userId, {
      firstName,
      lastName,
      phone,
      dateOfBirth,
    });
    res.json(updatedUser);
  } catch (error: any) {
    if (error.message === "Email already exists") {
      return res.status(400).json({ error: "Email already exists" });
    }
    throw error;
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { currentPassword, newPassword } = req.body;

  try {
    const result = await updateUserPassword(
      userId,
      currentPassword,
      newPassword
    );
    res.json(result);
  } catch (error: any) {
    if (error.message === "Current password is incorrect") {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    if (error.message === "User not found") {
      return res.status(404).json({ error: "User not found" });
    }
    throw error;
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Generate avatar URL
    const avatarUrl = `${req.protocol}://${req.get("host")}/avatars/${
      req.file.filename
    }`;

    const result = await updateUserAvatar(userId, avatarUrl);
    res.json(result);
  } catch (error: any) {
    if (error.message === "User not found") {
      return res.status(404).json({ error: "User not found" });
    }
    throw error;
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const addressId = parseInt(req.params.addressId);

  if (isNaN(addressId)) {
    return res.status(400).json({ error: "Invalid address ID" });
  }

  try {
    const result = await updateUserAddress(userId, addressId, req.body);
    res.json(result);
  } catch (error: any) {
    if (error.message === "Address not found or does not belong to user") {
      return res
        .status(404)
        .json({ error: "Address not found or does not belong to user" });
    }
    throw error;
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const addressId = parseInt(req.params.addressId);

  if (isNaN(addressId)) {
    return res.status(400).json({ error: "Invalid address ID" });
  }

  try {
    const result = await deleteUserAddress(userId, addressId);
    res.json(result);
  } catch (error: any) {
    if (error.message === "Address not found or does not belong to user") {
      return res
        .status(404)
        .json({ error: "Address not found or does not belong to user" });
    }
    throw error;
  }
};
