#!/usr/bin/env bun
import { Command } from "commander";
import prisma from "./db/db";

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
      console.log("Tables truncated successfully");
    } catch (error) {
      console.error("Error truncating tables:", error);
    }
  });

program.parse(process.argv);
