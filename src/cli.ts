#!/usr/bin/env bun
import { Command } from "commander";
import prisma from "./db/db";

const program = new Command();

program
  .name("guntrader-api-sync")
  .description("CLI to manage Guntrader operations")
  .version("1.0.0");

program
  .command("reset-db")
  .description("Reset the database by dropping all records")
  .action(async () => {
    try {
      console.log("Resetting database...");
      await prisma.$executeRaw`TRUNCATE TABLE gun, image CASCADE;`;
      await prisma.$disconnect();
      console.log("Database reset completed!");
    } catch (error) {
      console.error("Error resetting database:", error);
    }
  });
