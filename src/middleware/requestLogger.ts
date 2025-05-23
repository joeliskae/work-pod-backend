import { Request, Response, NextFunction } from "express";

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

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;

    const userEmail = (req.user as any)?.email || "anonymous";
    const paddedEmail = padRight(userEmail, 25);  // 25 merkkiä leveä kenttä

    const method = req.method.padEnd(6, " ");    // 6 merkkiä: esim. "DELETE", "POST  ", "GET   "
    const statusCode = padLeft(res.statusCode.toString(), 3); // 3 merkkiä oikealle tasattu

    // Duration muodossa esim "   15ms", "  100ms", " 2300ms" eli max 6 merkkiä, oikealle tasattu
    const duration = padLeft(durationMs.toString() + "ms", 6);

    const logLine = `[${new Date().toISOString()}] ${paddedEmail} ${method} ${req.originalUrl} | code: ${statusCode} - time: ${duration}`;

    console.log(logLine);
  });

  next();
}
