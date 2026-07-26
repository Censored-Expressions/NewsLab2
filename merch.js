const merchGrid = document.querySelector("[data-merch-grid]");

function merchEscape(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function merchList(value = []) {
  return Array.isArray(value) ? value : String(value || "").split(",").map(item => item.trim()).filter(Boolean);
}

function renderMerchCard(product) {
  const colors = merchList(product.colors);
  const sizes = merchList(product.sizes);
  return `
    <article class="shop-card ${product.featured ? "featured-product" : ""}">
      <img class="shop-card-image" src="${merchEscape(product.image || "./assets/logo.png")}" alt="${merchEscape(product.title)}" />
      <span>${merchEscape(product.category || "Merchandise")}</span>
      <h3>${merchEscape(product.title)}</h3>
      <p>${merchEscape(product.description)}</p>
      <strong class="shop-price">${merchEscape(product.price || "Request quote")}</strong>
      <div class="merch-meta">
        ${colors.slice(0, 4).map(color => `<span>${merchEscape(color)}</span>`).join("")}
      </div>
      <button
        class="story-button order-trigger"
        type="button"
        data-product="${merchEscape(product.title)}"
        data-price="${merchEscape(product.price || "Request quote")}"
        data-colors="${merchEscape(colors.join(", "))}"
        data-sizes="${merchEscape(sizes.join(", ") || "One size")}"
      >Order</button>
    </article>
  `;
}

function wireMerchOrderButtons(scope = document) {
  scope.querySelectorAll("[data-product]").forEach(trigger => {
    if (trigger.dataset.orderWired) return;
    trigger.dataset.orderWired = "true";
    trigger.addEventListener("click", () => {
      fetch("/api/merch/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventType: "view",
          product: trigger.dataset.product,
          size: "",
          color: "",
          quantity: 0,
          source: "merch-product-click"
        })
      }).catch(() => {});
      window.openMerchOrder?.(trigger);
    });
  });
}

async function loadMerchCatalog() {
  if (!merchGrid) return;
  try {
    const response = await fetch("/api/merch/products");
    if (!response.ok) throw new Error("Merch catalog request failed.");
    const payload = await response.json();
    const products = payload.products || [];
    if (!products.length) return;
    merchGrid.innerHTML = products.map(renderMerchCard).join("");
    wireMerchOrderButtons(merchGrid);
  } catch {
    wireMerchOrderButtons(document);
  }
}

loadMerchCatalog();
