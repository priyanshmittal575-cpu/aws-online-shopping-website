const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3018;
const PUBLIC_DIR = path.join(__dirname, "public");
const ORDERS_FILE = path.join(__dirname, "orders.json");

if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");

const products = [
  { id: 1, title: "Mechanical Keyboard (Blue Switch)", category: "Accessories", price: 2199, specs: "87-key TKL layout, USB-C detachable cable, anti-ghosting." },
  { id: 2, title: "Ergonomic Laptop Stand (Aluminum)", category: "Workspace", price: 899, specs: "Foldable anodized aluminum stand for 13-16 inch laptops." },
  { id: 3, title: "Arduino Uno R3 Starter Kit", category: "Electronics", price: 1450, specs: "Includes Uno board, breadboard, jumper wires, LEDs, and sensors." },
  { id: 4, title: "Wireless Optical Mouse", category: "Accessories", price: 649, specs: "2.4GHz USB receiver, 1600 DPI silent clicks." },
  { id: 5, title: "USB-C 6-in-1 Hub Adapter", category: "Workspace", price: 1299, specs: "HDMI 4K, 3x USB 3.0, SD/TF card reader." },
  { id: 6, title: "Raspberry Pi Pico H", category: "Electronics", price: 480, specs: "RP2040 dual-core ARM Cortex-M0+ microcontroller with headers." }
];

const mime = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript" };

http.createServer((req, res) => {
  const cleanUrl = req.url.split("?")[0];

  if (req.method === "GET" && cleanUrl === "/api/products") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(products));
  }

  if (req.method === "POST" && cleanUrl === "/api/orders") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const { customerName, items, total } = JSON.parse(body);
      const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8"));
      const order = {
        orderId: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        customerName: customerName || "Student Buyer",
        items,
        total,
        date: new Date().toLocaleString("en-IN")
      };
      orders.unshift(order);
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(order));
    });
    return;
  }

  const rel = cleanUrl === "/" ? "index.html" : cleanUrl.replace(/^\/+/, "");
  const filePath = path.join(PUBLIC_DIR, rel);
  if (filePath.startsWith(PUBLIC_DIR) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "text/plain" });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
}).listen(PORT, () => console.log(`Online Shopping Store running at http://localhost:${PORT}`));