import { authService } from "@/services/auth/auth.service";
import { createdResponse } from "@/utils/responses";
import { type Request, type Response } from "express";

export async function register(req: Request, res: Response) {
  const data = req.body;
  const user = await authService.registerUser(data);
  return createdResponse(res, "User registered successfully", {
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      credits: user.credits,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  });
}
