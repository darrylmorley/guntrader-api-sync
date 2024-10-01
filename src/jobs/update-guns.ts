import { schedule } from "node-cron";

import prisma from "../db/db";
import log from "../services/logger";
import fetchGunData from "../services/gun-trader-client";
import { saveImageToDO, deleteImageFromDO } from "../services/handle-images";

import type { GunData } from "../types/types";

export const updateDatabase = async (data: GunData[]) => {
  let productsDeleted = 0;
  let imagesUpdated = 0;
  let imagesDeleted = 0;

  try {
    const existingGunIds = await prisma.gun.findMany({
      select: {
        guntrader_id: true,
      },
    });

    const existingGunIdsSet = new Set(
      existingGunIds.map((gun: any) => gun.guntrader_id)
    );

    const incomingGunIdsSet = new Set(data.map((gun) => gun.id.toString()));

    const deadGunIds = [...existingGunIdsSet].filter(
      (id) => !incomingGunIdsSet.has(id)
    );

    log.info({ deadGunIds }, "Dead gun IDs");

    // Delete images from DO
    if (deadGunIds.length) {
      // Step 3: Fetch the corresponding images for the guns to be deleted
      const imagesToDelete = await prisma.image.findMany({
        where: {
          guntrader_gun_id: {
            in: deadGunIds,
          },
        },
        select: {
          original_url: true,
        },
      });

      // Step 4: Delete the images from DigitalOcean
      for (const image of imagesToDelete) {
        if (!image.original_url) continue;
        const imageKey = image.original_url.split(".com/")[1];
        await deleteImageFromDO(imageKey); // Delete each image from DO
        imagesDeleted++; // Increment count for deleted images
      }

      await prisma.gun.deleteMany({
        where: {
          guntrader_id: { in: deadGunIds },
        },
      });
      productsDeleted += deadGunIds.length;

      deadGunIds.length = 0;
      imagesToDelete.length = 0;
    }

    for (const gun of data) {
      const attributes = gun.attributes || [];
      const findAttribute = (attrName: string) =>
        attributes.find((attr) => attr.attribute === attrName)?.value || null;

      const gunData = {
        guntrader_id: gun.id.toString(),
        is_new: gun.is_new,
        type: gun.type,
        certification_type: gun.certification_type,
        mechanism: gun.mechanism,
        make: gun.make,
        model: gun.model,
        model2: gun.model_2,
        name: gun.name,
        description: gun.description,
        calibre: gun.calibre,
        stock_number: gun.stock_number,
        serial_number: gun.serial_number,
        year_of_manufacture: gun.year_of_manufacture || null,
        country_of_origin: gun.country_of_origin || null,
        guntrader_url: gun.url,
        price: Math.round(parseFloat(gun.sell_price) * 100),
        barrel_dimensions: findAttribute("barreldimensions"),
        choke: findAttribute("choke"),
        choke2: findAttribute("choke2"),
        orientation: findAttribute("orientation"),
        stock_dimensions: findAttribute("stockdimensions"),
        trigger: findAttribute("trigger"),
      };

      // Upsert gun and get its primary key (id)
      const upsertedGun = await prisma.gun.upsert({
        where: { guntrader_id: gun.id.toString() },
        update: gunData,
        create: gunData,
      });

      if (gun.images_count > 0) {
        // Map over images and process them in parallel
        const imageUploadPromises = gun.images.map(async (image, index) => {
          // Check if the image already exists in the database
          const existingImage = await prisma.image.findUnique({
            where: { guntrader_id: image.identifier }, // Check using the unique identifier (guntrader_id)
          });

          // Skip upload if the image is already present in the database with a valid original_url
          if (existingImage && existingImage.original_url) {
            return;
          }

          try {
            // Upload the image to DigitalOcean and get the new URL
            const imageName = (
              gun.make +
              "-" +
              gun.model +
              "-" +
              gun.type +
              "-" +
              gun.calibre +
              "-" +
              gun.id +
              "-" +
              index +
              ".jpg"
            )
              .replaceAll(" ", "-")
              .toLowerCase();
            const uploadedImageUrl = await saveImageToDO(
              image.paths.original,
              imageName
            );

            const imageData = {
              guntrader_id: image.identifier,
              gun_id: upsertedGun.id,
              guntrader_gun_id: gun.id.toString(),
              small_url: image.paths.small,
              medium_url: image.paths.medium,
              large_url: image.paths.large,
              original_url: uploadedImageUrl,
              is_primary: image.is_primary || false,
            };

            // Upsert image data in database
            await prisma.image.upsert({
              where: { guntrader_id: image.identifier },
              update: imageData,
              create: imageData,
            });

            imagesUpdated++;
          } catch (error) {
            log.error("Error uploading image:", error);
          }
        });

        // Wait for all image uploads to complete before moving to the next gun
        await Promise.all(imageUploadPromises);

        // Clear image array after processing
        imageUploadPromises.length = 0;
        gun.images.length = 0;
      }
    }

    log.info(`${data.length} products updated`);
    log.info(`${productsDeleted} products deleted`);
    log.info(`${imagesUpdated} images uploaded`);
    log.info(`${imagesDeleted} images deleted`);

    // Clear data after processing
    data.length = 0;
    deadGunIds.length = 0;
  } catch (error) {
    log.error("Error updating database", error);
  }
};

const updateGuns = async () => {
  log.info("Updating database");

  const gunData = await fetchGunData();
  await updateDatabase(gunData);

  gunData.length = 0;

  log.info("Database updated");
};

export default updateGuns;
