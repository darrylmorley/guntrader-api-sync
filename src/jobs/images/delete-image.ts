import { doClient, DeleteObjectCommand } from "../../services/do-client";
import log from "../../services/logger";

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

export default deleteImageFromDO;
