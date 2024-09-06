import { Hono } from "hono";
import guns from "./routes/guns";
import images from "./routes/images";
import updateGuns from "./jobs/guns/update-guns";

const app = new Hono();
updateGuns.start();

app.route("/guns", guns);
app.route("/images", images);

export default app;
