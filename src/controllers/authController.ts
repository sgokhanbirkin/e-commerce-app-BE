import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  addUserAddress,
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
