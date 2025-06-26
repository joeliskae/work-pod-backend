// (c) 2025 Oskari Suonpää
import { Response } from "express";

const returnErrorResponse = (
  response: Response,
  statusCode: number,
  message: string
) => {
  console.error(`[${new Date().toISOString()}] Error: `, message);
  response.status(statusCode).json({ success: false, message });
};

export default returnErrorResponse;
