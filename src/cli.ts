#!/usr/bin/env bun
import { Command } from "commander";
import prisma from "./db/db";
import log from "./services/logger";
import fetchGunData from "./services/gun-trader-client";
import { updateDatabase } from "./jobs/update-guns";

const program = new Command();

program
  .name("guntrader-api-sync")
  .description("CLI to manage Guntrader-API-Sync operations")
  .version("1.0.0");

program
  .command("reset")
  .description("Reset the database by dropping all records")
  .action(async () => {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Gun", "Image" CASCADE;`);
      log.info("Tables truncated successfully");
    } catch (error) {
      log.error("Error truncating tables:", error);
    }
  });

program
  .command("sync")
  .description("Sync the database with Guntrader API")
  .action(async () => {
    try {
      log.info("Updating database");

      const gunData = await fetchGunData();
      await updateDatabase(gunData);

      log.info("Database updated");
    } catch (error) {
      log.error("Error syncing db:", error);
    }
  });

program.parse(process.argv);
