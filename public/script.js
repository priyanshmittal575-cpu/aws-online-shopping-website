let products = [];
let cart = {};

async function init() {
  const res = await fetch("/api/products");
  products = await res.json();
  renderProducts();
}

function renderProducts() {
  const q = document.getElementById("searchBox").value.toLowerCase();
  const cat = document.getElementById("catFilter").value;
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  products
    .filter((p) => (cat === "All" || p.category === cat) && p.title.toLowerCase().includes(q))
    .forEach((p) => {
      const div = document.createElement("div");
      div.className = "p-card";
      div.innerHTML = `
        <div>
          <span class="p-cat">${p.category}</span>
          <h3>${p.title}</h3>
          <p>${p.specs}</p>
        </div>
        <div class="p-foot">
          <strong>₹${p.price}</strong>
          <button onclick="addItem(${p.id})">+ Add</button>
        </div>
      `;
      grid.appendChild(div);
    });
}

window.addItem = (id) => {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
};

window.updateQty = (id, delta) => {
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
};

function renderCart() {
  const list = document.getElementById("cartList");
  const ids = Object.keys(cart);
  list.innerHTML = "";
  let total = 0;

  if (ids.length === 0) {
    list.innerHTML = `<p class="muted">Cart is empty.</p>`;
    document.getElementById("totalPrice").textContent = "₹0";
    document.getElementById("checkoutBtn").disabled = true;
    return;
  }

  ids.forEach((id) => {
    const prod = products.find((p) => p.id === Number(id));
    const qty = cart[id];
    total += prod.price * qty;
    const row = document.createElement("div");
    row.className = "c-row";
    row.innerHTML = `
      <span>${prod.title} (₹${prod.price})</span>
      <div>
        <button onclick="updateQty(${prod.id}, -1)">-</button>
        <strong>${qty}</strong>
        <button onclick="updateQty(${prod.id}, 1)">+</button>
      </div>
    `;
    list.appendChild(row);
  });

  document.getElementById("totalPrice").textContent = `₹${total}`;
  document.getElementById("checkoutBtn").disabled = false;
}

document.getElementById("checkoutBtn").addEventListener("click", async () => {
  const buyer = document.getElementById("buyerName").value.trim() || "Student Customer";
  const items = Object.keys(cart).map((id) => {
    const p = products.find((x) => x.id === Number(id));
    return { title: p.title, qty: cart[id], subtotal: p.price * cart[id] };
  });
  const total = items.reduce((s, i) => s + i.subtotal, 0);

  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerName: buyer, items, total })
  });
  const order = await res.json();

  cart = {};
  renderCart();
  const receipt = document.getElementById("orderReceipt");
  receipt.textContent = `Order Saved! ID: ${order.orderId} | Total Paid (Simulated): ₹${order.total}`;
  receipt.classList.remove("hidden");
});

document.getElementById("searchBox").addEventListener("input", renderProducts);
document.getElementById("catFilter").addEventListener("change", renderProducts);
init();