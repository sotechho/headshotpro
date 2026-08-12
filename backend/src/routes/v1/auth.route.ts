import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/me", (req: Request, res: Response) => {
  res
    .status(200)
    .json({
      message: "Auth route is working",
      status: "success",
      timestamp: new Date().toISOString(),
    });
});

export default router;
