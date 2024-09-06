import type { GunData } from "../jobs/guns/types";
import log from "./logger";

const fetchGunData = async () => {
  try {
    const guns = await fetch(
      "https://guntrader.uk/api/v1/gun-rack?withImages=true&withAttributes=true",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Bun.env["GUNTRADER_API_KEY"]}`,
        },
      }
    );

    const data = await guns.json();

    if (!Array.isArray(data)) {
      throw new Error("API did not return an array");
    }

    return data as GunData[];
  } catch (error) {
    log.error(error);
    process.exit(1);
  }
};

export default fetchGunData;
