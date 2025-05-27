import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth";

function padRight(str: string, length: number): string {
  if (str.length >= length) {
    return str.slice(0, length - 3) + "...";
  }
  return str + " ".repeat(length - str.length);
}

function padLeft(str: string, length: number): string {
  if (str.length >= length) {
    return str.slice(0, length);
  }
  return " ".repeat(length - str.length) + str;
}

function shortenAndPad(str: string, maxLen: number): string {
  if (str.length > maxLen) {
    return str.slice(0, maxLen - 3) + "...";
  }
  return str.padEnd(maxLen, " ");
}


export function requestLogger(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;

    const userEmail = (req.user)?.email || "anonymous";
    const paddedEmail = padRight(userEmail, 30);

    const method = req.method.padEnd(6, " ");

    const pathOnly = shortenAndPad(req.path, 25);

    const statusCode = padLeft(res.statusCode.toString(), 3);

    const duration = padLeft(durationMs.toString() + "ms", 6);

    // Merkit cache-hitille ja spamGuardille
    const cacheInfo = req.cacheHit ? " [cache]" : "";
    const blockedTag = (res.locals.blocked === true) ? " [spam]" : "";

    const logLine = `[${new Date().toISOString()}] ${paddedEmail} | ${method} ${pathOnly} | code: ${statusCode} - time: ${duration} ${cacheInfo}${blockedTag}`;

    console.log(logLine);
  });

  next();
}
