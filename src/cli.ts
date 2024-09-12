#!/usr/bin/env bun
import { Command } from "commander";
import prisma from "./db/db";
import log from "./services/logger";

const program = new Command();

program
  .name("guntrader-api-sync")
  .description("CLI to manage Guntrader-API-Sync operations")
  .version("1.0.0");

program
  .command("reset-db")
  .description("Reset the database by dropping all records")
  .action(async () => {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Gun", "Image" CASCADE;`);
      log.info("Tables truncated successfully");
    } catch (error) {
      log.error("Error truncating tables:", error);
    }
  });

program.parse(process.argv);
