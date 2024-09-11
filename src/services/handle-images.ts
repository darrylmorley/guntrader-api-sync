import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { doClient } from "./do-client";
import log from "./logger";

// Helper function to delay retries
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function deleteImageFromDO(imageKey: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: Bun.env["S3_SPACE_NAME"],
      Key: imageKey,
    });
    await doClient.send(command);
  } catch (error) {
    log.error(`Error deleting image from DO: ${imageKey}`, error);
  }
}

async function saveImageToDO(
  imageUrl: string,
  imageName: string,
  retries = 3,
  delayTime = 1000
): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Fetch the image data
      const response = await fetch(imageUrl);
      const imageBuffer = await response.arrayBuffer();

      const contentType =
        response.headers.get("content-type") || "application/octet-stream";
      const key = `guns/${imageName}`;

      // Prepare upload command
      const command = new PutObjectCommand({
        Bucket: Bun.env["S3_SPACE_NAME"],
        Key: key,
        Body: new Uint8Array(imageBuffer),
        ContentType: contentType,
        ACL: "public-read",
      });

      // Upload to DigitalOcean Space
      await doClient.send(command);

      const fileUrl = `https://${Bun.env["S3_SPACE_NAME"]}.${Bun.env["S3_REGION"]}.digitaloceanspaces.com/${key}`;

      log.info(
        `Image uploaded successfully on attempt ${attempt}. File URL:`,
        fileUrl
      );
      return fileUrl; // Return the URL after successful upload
    } catch (error) {
      log.error(
        `Error uploading image (attempt ${attempt}/${retries}):`,
        error
      );

      // If we've exhausted the retries, log failure
      if (attempt === retries) {
        log.error(
          `Failed to upload image after ${retries} attempts:`,
          imageUrl
        );
        return null; // Return null if all retries fail
      }

      // Wait for the specified delay before retrying
      await delay(delayTime);
    }
  }
  return null; // In case all attempts fail
}

export { deleteImageFromDO, saveImageToDO };
