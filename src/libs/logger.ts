import path from "node:path";
import process from "node:process";
import fs from "node:fs";
import winston from "winston";

export class Logger {
  public logger: winston.Logger;

  constructor(
    private readonly name: string,
    private readonly _dirname: string = path.join(process.cwd(), "logs")
  ) {
    fs.mkdirSync(this._dirname, { recursive: true });

    const date = new Date();
    const dateString = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.label({
          label: `${path.relative(process.cwd(), __filename)} ${this.name}`,
        }),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(
          (info) =>
            `[${info.timestamp} | ${info.label} - ${info.level}]: ${info.message}`
        )
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: `${this._dirname}/${dateString}.log`,
        }),
      ],
    });
  }
}
