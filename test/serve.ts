import index from "./index.html";

Bun.serve({
  routes: { "/": index },
  port: 3456,
});

console.log(`Open http://localhost:3456/`);
