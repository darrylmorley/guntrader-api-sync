import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.json({}));
app.post("/", (c) => c.json({}));
app.get("/:id", (c) => c.json({}));

export default app;
