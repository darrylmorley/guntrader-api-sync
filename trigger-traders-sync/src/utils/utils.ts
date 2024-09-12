import log from "../services/logger";
import type { DbProduct, TriggerTradersProduct } from "../types/types";

async function imageUrlToBase64(imageUrl: string): Promise<string | undefined> {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    // Assuming it's an image/jpeg, you can modify this for other types like 'image/png'
    return base64Image;
  } catch (error) {
    if (error instanceof Error) {
      log.error(`Error converting image to base64: ${error.message}`);
    } else {
      log.error(`Error converting image to base64: ${String(error)}`);
    }
    return undefined;
  }
}

async function mapDbProductToTriggerTradersProduct(
  product: DbProduct
): Promise<TriggerTradersProduct> {
  if (!product.images) {
    throw new Error("Product images are undefined");
  }

  const BATCH_SIZE = 10; // Limit to 10 concurrent requests

  const images = [];

  for (let i = 0; i < product.images.length; i += BATCH_SIZE) {
    const batch = product.images.slice(i, i + BATCH_SIZE);

    const base64Batch = await Promise.all(
      batch.map(async (image: { original_url: string }) => {
        try {
          return await imageUrlToBase64(image.original_url);
        } catch (error) {
          console.error(
            `Failed to convert image: ${image.original_url}`,
            error
          );
          return null; // Or a default placeholder image in base64
        }
      })
    );

    images.push(...base64Batch);
  }

  return {
    client_email: Bun.env["TRIGGER_TRADERS_USER"] || "",
    client_external_system_id: "1",
    product_external_system_id: `ssltd_${product.guntrader_id}`,
    advert_type: "1",
    advert_status_id: "1",
    product_details: product.type,
    mechanism: product.mechanism,
    manufacturer: product.make,
    model: product.model,
    calibre: product.calibre,
    condition: product.is_new ? "New" : "Used",
    orientation: product.orientation ? product.orientation : "",
    stock_length: product.stock_dimensions ? product.stock_dimensions : "",
    barrel_length: product.barrel_dimensions ? product.barrel_dimensions : "",
    trigger_type: product.trigger ? product.trigger : "",
    choke_type: product.choke ? product.choke : "",
    price: product.price ? `${product.price / 100}` : "0",
    img: [...images],
  };
}

export { imageUrlToBase64, mapDbProductToTriggerTradersProduct };
