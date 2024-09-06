import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const doClient = new S3Client({
  endpoint: Bun.env["S3_ENDPOINT"] || "https://lon1.digitaloceanspaces.com",
  region: Bun.env["S3_REGION"] || "lon1",
  credentials: {
    accessKeyId: Bun.env["S3_ACCESS_KEY"] || "",
    secretAccessKey: Bun.env["S3_SECRET_KEY"] || "",
  },
});

export { doClient, PutObjectCommand, DeleteObjectCommand };
