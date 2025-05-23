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

function shortenAndPad(str: string, maxLen: number): string {
  if (str.length > maxLen) {
    return str.slice(0, maxLen - 3) + "...";
  }
  return str.padEnd(maxLen, " ");
}


export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;

    const userEmail = (req.user as any)?.email || "anonymous";
    const paddedEmail = padRight(userEmail,30);  // 25 merkkiä leveä kenttä

    const method = req.method.padEnd(6, " ");    // 6 merkkiä leveä kenttä, esim "DELETE", "POST  ", "GET   "

    const pathOnly = shortenAndPad((req.path), 25);
    // const pathOnly = req.path.padEnd(25, " ");   // Tässä 15 merkkiä polun kentälle, voit säätää tarpeen mukaan

    const statusCode = padLeft(res.statusCode.toString(), 3); // 3 merkkiä oikealle tasattu

    const duration = padLeft(durationMs.toString() + "ms", 6); // 6 merkkiä oikealle tasattu

    // Koko rivi: aika, sähköposti, metodi, polku, statuskoodi ja kesto aina samalla kohdalla
    const logLine = `[${new Date().toISOString()}] ${paddedEmail} | ${method} ${pathOnly} | code: ${statusCode} - time: ${duration}`;

    console.log(logLine);
  });

  next();
}