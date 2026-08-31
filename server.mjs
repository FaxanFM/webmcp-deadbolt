import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT) || 4173;
const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json" };

createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  const relative = pathname === "/" ? "index.html" : pathname.slice(1);
  const file = normalize(join(root, relative));

  if (!file.startsWith(root)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const body = await readFile(file);
    response.writeHead(200, { "content-type": `${types[extname(file)] || "application/octet-stream"}; charset=utf-8` }).end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(port, () => console.log(`WebMCP Deadbolt: http://localhost:${port}`));
