import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

// Lies; truncator is actually very dumb
const smartTruncator = (function () {
  let foundItem = false;
  return new TransformStream({
    transform (chunk, controller) {
      // Only append chunks until we find an item, then truncate.

      if (!foundItem) {
        const tag = '</item>';

        if (chunk.indexOf(tag) === -1) {
          // Append chunks until we find a complete tag
          controller.enqueue(chunk);
        } else {
          // Then just append the part before the tag and increment
          controller.enqueue(chunk.split(tag)[0]);
          foundItem = true;
        }
      }
    },
    flush (controller) {
      controller.enqueue(`
            </item>
          </channel>
        </rss>
      `);
    }
  });
})();

console.log("hello world");
const router = new Router();
router
  .get("/test/:timestamp/:feedUrl", async (ctx) => {
    const feedSource = atob(ctx.params.feedUrl);
    if (Number(ctx.params.timestamp) < Math.floor(Date.now() / 1000)) {
      ctx.response.redirect(feedSource);
    } else {
      const res = await fetch(feedSource);
      ctx.response.body = res.body?.pipeThrough(new TextDecoderStream()).pipeThrough(smartTruncator);
    }
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener('listen', (event) => {
  console.log("Listening!", event.port);
});

const port = Number(Deno.env.get("PORT")) ?? 0;

await app.listen({ port: port });
