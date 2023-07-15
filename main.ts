import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

console.log("hello world");
const router = new Router();
router
  .get("/test/:timestamp/:feedUrl", async (ctx) => {
    const res = await fetch(atob(ctx.params.feedUrl));
    ctx.response.body = res.body;
  })

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener('listen', (event) => {
  console.log("Listening!", event.port);
});

await app.listen();
