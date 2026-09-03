import { headshotService } from '@/services/headshot';
import { successResponse } from '@/utils/responses';
import type { Request, Response } from 'express';

export async function getAvailableStyles(req: Request, res: Response) {
  const availableStyles = headshotService.getAvailableStyles();
  return successResponse(
    res,
    'Available Headshot Styles',
    200,
    availableStyles,
  );
}
