import { Hono } from "hono";
import { createMiddleware } from "hono/factory";

type Env = {
  Bindings: {
    COUNT: KVNamespace;
  };
  Variables: {
    name: string;
    count: number;
  };
};

const app = new Hono<Env>();

const kvnamespaceMiddleware = createMiddleware<Env>(async (c, next) => {
  const name = c.req.query("name");
  if (!name) {
    return c.text(
      "Select a KV Namespace to contact by using the `name` URL query string parameter, for example, ?name=A"
    );
  }

  c.set("name", name);
  await next();

  c.res = c.text(`KV name ${name} count: ${c.var.count}`);
});

app.get("/", kvnamespaceMiddleware, async (c, next) => {
  const name = c.get("name");
  const count = await c.env.COUNT.get(name);

  c.set("count", Number(count));
  await next();
});

app.get("/increment", kvnamespaceMiddleware, async (c, next) => {
  const name = c.get("name");
  const count = await c.env.COUNT.get(name);
  const newCount = Number(count) + 1;

  await c.env.COUNT.put(name, newCount.toString());

  c.set("count", newCount);
  await next();
});

app.get("/decrement", kvnamespaceMiddleware, async (c, next) => {
  const name = c.get("name");
  const count = await c.env.COUNT.get(name);
  const newCount = Number(count) - 1;

  await c.env.COUNT.put(name, newCount.toString());

  c.set("count", newCount);
  await next();
});

export default app;
