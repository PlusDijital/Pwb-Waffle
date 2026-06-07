const CONTENT_ENDPOINT = "/api/content";
const PASSWORD_KEY = "pwb-admin-password";

const productDefaults = [
  ["Kızıl Tutku", "Kırmızı meyveler, çikolata sos, beyaz sos ve çıtır fıstık parçacıkları.", "Meyveli yoğun", "assets/waffle-kirmizi.jpeg", "meyveli", "Kırmızı meyveler, çikolata sos, beyaz sos, çıtır fıstık"],
  ["Serotonin", "Çilek, muz, böğürtlen, özel soslar ve bol fıstıkla mutluluk tabağı.", "Çok sevilen", "assets/waffle-karisik.jpeg", "special", "Çilek, muz, böğürtlen, özel soslar, bol fıstık"],
  ["Kırmızı Beyaz", "Kırmızı meyveler, bol beyaz çikolata, özel sos ve fıstık parçacıkları.", "İmza lezzet", "assets/waffle-beyaz.jpeg", "meyveli", "Kırmızı meyveler, beyaz çikolata, özel sos, fıstık"],
  ["Special", "Muz, kırmızı meyveler, sütlü ve bitter çikolata ile bol malzemeli özel tabak.", "Bol malzeme", "assets/waffle-bitter.jpeg", "special", "Muz, kırmızı meyveler, sütlü çikolata, bitter çikolata"],
  ["Karbonhidrat", "Yoğun meyve, farklı soslar ve çıtır waffle tabanıyla enerji dolu seçim.", "Enerjik", "assets/waffle-special.jpeg", "special", "Yoğun meyve, karışık soslar, çıtır waffle"],
  ["Dubai Waffle", "Fıstık sos, sütlü çikolata ve bol fıstıkla daha yoğun, daha premium tat.", "Premium", "assets/waffle-fistik.jpeg", "premium", "Fıstık sos, sütlü çikolata, bol fıstık"],
  ["Karamel Fıstık", "Karamel dokunuşu, fıstık sos, çilek, muz ve akışkan çikolata.", "Özel soslu", "assets/karamel-fistik.png", "premium", "Karamel, fıstık sos, çilek, muz, çikolata"],
  ["Klasik", "Çilek, muz, sütlü çikolata, beyaz sos ve fıstık parçacıkları.", "Vazgeçilmez", "assets/waffle-cilek-muz-wide.jpeg", "cikolatali", "Çilek, muz, sütlü çikolata, beyaz sos, fıstık"],
  ["Karabela", "Böğürtlen, kırmızı meyveler, bitter çikolata ve güçlü meyve aroması.", "Bitter meyveli", "assets/waffle-orman.jpeg", "cikolatali", "Böğürtlen, kırmızı meyveler, bitter çikolata, fıstık"],
];

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `product-${Date.now()}-${Math.random()}`;
}

const defaultData = {
  heroEyebrow: "Adapazarı Çark Caddesi'nin en tatlı durağı",
  heroTitle: "Peanut Waffle",
  heroCopy:
    "Günlük taze meyve, bol sos, çıtır waffle ve her lokmada mutluluk. Special Bowl'dan klasik waffle'a kadar tatlı mola burada başlar.",
  menuTitle: "Waffle Menüsü",
  venueTitle: "Peanut Waffle Adapazarı",
  venueDescription:
    "Pembe-siyah enerjisiyle Çark Caddesi'nde seni bekliyoruz. İçeride oturabilir, dışarıda tatlı molası verebilir ya da siparişini paket olarak alabilirsin.",
  hours: "12:00 - 23:00",
  location: "Çark Caddesi",
  city: "Adapazarı",
  address: "Çark Caddesi, Adapazarı / Sakarya",
  products: productDefaults.map(([name, description, tag, image, category, ingredients]) => ({
    id: makeId(),
    name,
    description,
    tag,
    image,
    category,
    ingredients,
    visible: true,
  })),
};

const form = document.querySelector("#admin-form");
const productsEditor = document.querySelector("#products-editor");
const status = document.querySelector("#save-status");
const resetButton = document.querySelector("#reset-button");
const addButton = document.querySelector("#add-product");
const passwordInput = document.querySelector("#admin-password");
let products = [];

passwordInput.value = sessionStorage.getItem(PASSWORD_KEY) || "";
passwordInput.addEventListener("input", () => {
  sessionStorage.setItem(PASSWORD_KEY, passwordInput.value);
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeProduct(product) {
  return {
    id: product.id || makeId(),
    name: product.name || "Yeni Ürün",
    description: product.description || "",
    tag: product.tag || "Yeni",
    image: product.image || "assets/waffle-karisik.jpeg",
    category: product.category || "special",
    ingredients: product.ingredients || product.description || "",
    visible: product.visible !== false,
  };
}

async function getSavedData() {
  try {
    const response = await fetch(CONTENT_ENDPOINT);
    const saved = response.ok ? await response.json() : null;
    if (!saved) return clone(defaultData);
    return {
      ...clone(defaultData),
      ...saved,
      products: (saved.products || defaultData.products).map(normalizeProduct),
    };
  } catch {
    return clone(defaultData);
  }
}

function categoryOptions(selected) {
  return [
    ["meyveli", "Meyveli"],
    ["cikolatali", "Çikolatalı"],
    ["special", "Special"],
    ["premium", "Premium"],
  ]
    .map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`)
    .join("");
}

function renderProducts() {
  productsEditor.innerHTML = products
    .map(
      (product, index) => `
        <article class="product-editor" data-index="${index}">
          <div class="product-editor-header">
            <h3>${index + 1}. ${escapeHtml(product.name)}</h3>
            <div class="product-tools">
              <button type="button" data-action="up" title="Yukarı taşı" ${index === 0 ? "disabled" : ""}>↑</button>
              <button type="button" data-action="down" title="Aşağı taşı" ${index === products.length - 1 ? "disabled" : ""}>↓</button>
              <button type="button" data-action="delete" title="Ürünü sil">×</button>
            </div>
          </div>
          <img class="product-preview" src="${escapeHtml(product.image)}" alt="" />
          <label>
            Ürün görseli
            <input data-field="image-upload" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
          <label>
            Ürün adı
            <input data-field="name" type="text" value="${escapeHtml(product.name)}" />
          </label>
          <label>
            Açıklama
            <textarea data-field="description" rows="3">${escapeHtml(product.description)}</textarea>
          </label>
          <label>
            İçindekiler
            <textarea data-field="ingredients" rows="2">${escapeHtml(product.ingredients)}</textarea>
          </label>
          <label>
            Kart etiketi
            <input data-field="tag" type="text" value="${escapeHtml(product.tag)}" />
          </label>
          <div class="product-options">
            <label>
              Kategori
              <select data-field="category">${categoryOptions(product.category)}</select>
            </label>
            <label class="visibility-toggle">
              <input data-field="visible" type="checkbox" ${product.visible ? "checked" : ""} />
              Yayında
            </label>
          </div>
        </article>
      `,
    )
    .join("");
}

function populateForm(data) {
  Object.entries(data).forEach(([key, value]) => {
    if (key === "products") return;
    const field = form.elements.namedItem(key);
    if (field) field.value = value;
  });
  products = data.products.map(normalizeProduct);
  renderProducts();
}

function syncProductsFromDom() {
  productsEditor.querySelectorAll(".product-editor").forEach((editor) => {
    const index = Number(editor.dataset.index);
    const product = products[index];
    product.name = editor.querySelector('[data-field="name"]').value.trim();
    product.description = editor.querySelector('[data-field="description"]').value.trim();
    product.ingredients = editor.querySelector('[data-field="ingredients"]').value.trim();
    product.tag = editor.querySelector('[data-field="tag"]').value.trim();
    product.category = editor.querySelector('[data-field="category"]').value;
    product.visible = editor.querySelector('[data-field="visible"]').checked;
  });
}

function collectData() {
  syncProductsFromDom();
  const data = {};

  Object.keys(defaultData).forEach((key) => {
    if (key === "products") return;
    data[key] = form.elements.namedItem(key).value.trim();
  });

  data.products = products;
  return data;
}

async function compressImage(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = reject;
    element.src = dataUrl;
  });

  const maxWidth = 1200;
  const scale = Math.min(1, maxWidth / image.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", 0.82);
}

addButton.addEventListener("click", () => {
  syncProductsFromDom();
  products.push(
    normalizeProduct({
      name: "Yeni Ürün",
      description: "Ürün açıklamasını buraya yazın.",
      ingredients: "İçindekileri buraya yazın.",
      tag: "Yeni",
    }),
  );
  renderProducts();
  productsEditor.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
});

productsEditor.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  syncProductsFromDom();
  const editor = button.closest(".product-editor");
  const index = Number(editor.dataset.index);
  const action = button.dataset.action;

  if (action === "delete") {
    if (!window.confirm(`"${products[index].name}" ürününü silmek istiyor musunuz?`)) return;
    products.splice(index, 1);
  } else if (action === "up" && index > 0) {
    [products[index - 1], products[index]] = [products[index], products[index - 1]];
  } else if (action === "down" && index < products.length - 1) {
    [products[index + 1], products[index]] = [products[index], products[index + 1]];
  }

  renderProducts();
});

productsEditor.addEventListener("change", async (event) => {
  if (event.target.dataset.field !== "image-upload" || !event.target.files[0]) return;

  syncProductsFromDom();
  const editor = event.target.closest(".product-editor");
  const index = Number(editor.dataset.index);
  status.textContent = "Görsel hazırlanıyor...";

  try {
    products[index].image = await compressImage(event.target.files[0]);
    renderProducts();
    status.textContent = "Görsel hazır. Kaydetmeyi unutmayın.";
  } catch {
    status.textContent = "Görsel yüklenemedi.";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const password = passwordInput.value.trim();
  if (!password) {
    status.textContent = "Kaydetmek için yönetici parolasını girin.";
    return;
  }

  status.textContent = "Kaydediliyor...";

  try {
    const response = await fetch(CONTENT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify(collectData()),
    });

    if (response.status === 401) {
      status.textContent = "Parola yanlış. Lütfen tekrar deneyin.";
    } else if (!response.ok) {
      status.textContent = "Kaydedilemedi. Lütfen tekrar deneyin.";
    } else {
      sessionStorage.setItem(PASSWORD_KEY, password);
      status.textContent = "Değişiklikler kaydedildi ve canlıya yansıdı.";
    }
  } catch {
    status.textContent = "Bağlantı hatası. Lütfen tekrar deneyin.";
  }

  window.setTimeout(() => {
    status.textContent = "";
  }, 4000);
});

resetButton.addEventListener("click", () => {
  populateForm(clone(defaultData));
  status.textContent = "Form varsayılan içerikle dolduruldu. Kaydetmeyi unutmayın.";
});

getSavedData().then(populateForm);
