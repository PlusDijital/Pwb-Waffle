const CONTENT_ENDPOINT = "/api/content";

function escapeContent(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function applySavedContent() {
  let data;

  try {
    const response = await fetch(CONTENT_ENDPOINT);
    data = response.ok ? await response.json() : null;
  } catch {
    data = null;
  }

  if (!data) return;

  const textFields = {
    heroEyebrow: "#hero-eyebrow",
    heroTitle: "#hero-title",
    heroCopy: "#hero-copy",
    menuTitle: "#menu-title",
    venueTitle: "#venue-title",
    venueDescription: "#venue-description",
    hours: "#quick-hours",
    location: "#quick-location",
    city: "#quick-city",
    address: "#contact-address",
  };

  Object.entries(textFields).forEach(([key, selector]) => {
    const element = document.querySelector(selector);
    if (element && data[key]) element.textContent = data[key];
  });

  document.querySelector("#venue-hours").textContent = data.hours || "12:00 - 23:00";
  document.querySelector("#contact-hours").textContent = data.hours || "12:00 - 23:00";
  document.querySelector("#venue-location").textContent = data.location || "Çark Caddesi";
  document.querySelector("#contact-title").textContent =
    `${data.city || "Adapazarı"} ${data.location || "Çark Caddesi"}`;

  let heroNames;

  if (Array.isArray(data.products)) {
    const fallbackImages = [
      "assets/waffle-kirmizi.jpeg",
      "assets/waffle-karisik.jpeg",
      "assets/waffle-beyaz.jpeg",
      "assets/waffle-bitter.jpeg",
      "assets/waffle-special.jpeg",
      "assets/waffle-fistik.jpeg",
      "assets/karamel-fistik.png",
      "assets/waffle-cilek-muz-wide.jpeg",
      "assets/waffle-orman.jpeg",
    ];
    const visibleProducts = data.products.filter((product) => product.visible !== false);
    const menuGrid = document.querySelector(".menu-grid");

    menuGrid.innerHTML = visibleProducts
      .map((product, index) => {
        const name = escapeContent(product.name || "Waffle");
        const description = escapeContent(product.description || "");
        const tag = escapeContent(product.tag || "Yeni");
        const ingredients = escapeContent(product.ingredients || product.description || "");
        const image = escapeContent(product.image || fallbackImages[index % fallbackImages.length]);
        const category = escapeContent(product.category || "special");

        return `
          <article class="menu-card" data-category="${category}" data-ingredients="${ingredients}">
            <img src="${image}" alt="${name} waffle" />
            <div>
              <h3>${name}</h3>
              <p>${description}</p>
              <strong>${tag}</strong>
              <button class="card-action" type="button">Detayları Gör</button>
            </div>
          </article>
        `;
      })
      .join("");

    heroNames = visibleProducts.slice(0, 4).map((product) => product.name);
  }

  return heroNames;
}

async function init() {
  const heroNames = await applySavedContent();

  const heroSlides = document.querySelectorAll(".hero-slide");
  const heroDots = document.querySelectorAll(".hero-dots span");
  const heroFeatureName = document.querySelector("#hero-feature-name");
  const heroFeatureNames =
    heroNames?.length === 4 ? heroNames : ["Serotonin", "Klasik", "Karabela", "Special"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeHeroSlide = 0;

  function showHeroSlide(index) {
    heroSlides[activeHeroSlide].classList.remove("is-active");
    heroDots[activeHeroSlide].classList.remove("is-active");
    activeHeroSlide = index;
    heroSlides[activeHeroSlide].classList.add("is-active");
    heroDots[activeHeroSlide].classList.add("is-active");
    if (heroFeatureName) {
      heroFeatureName.textContent = heroFeatureNames[activeHeroSlide];
    }
  }

  if (!reduceMotion && heroSlides.length > 1) {
    window.setInterval(() => {
      showHeroSlide((activeHeroSlide + 1) % heroSlides.length);
    }, 4200);
  }

  const revealItems = document.querySelectorAll(
    ".quick-info > div, .intro > *, .venue-gallery, .venue-copy, .section-heading, .menu-card, .special-copy, .special-band > img, .order-section > *, .contact-section > *, .footer-main, .footer-grid, .footer-links",
  );

  revealItems.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
  });

  if (reduceMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12,
      },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const filterButtons = document.querySelectorAll(".menu-filters button");
  const menuCards = document.querySelectorAll(".menu-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");

      menuCards.forEach((card) => {
        const categories = card.dataset.category || "";
        const shouldShow = filter === "all" || categories.includes(filter);
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });

  const modal = document.querySelector("#product-modal");
  const modalImage = document.querySelector("#modal-image");
  const modalTitle = document.querySelector("#modal-title");
  const modalTag = document.querySelector("#modal-tag");
  const modalDescription = document.querySelector("#modal-description");
  const modalIngredients = document.querySelector("#modal-ingredients");

  function openProductModal(card) {
    const image = card.querySelector("img");
    const title = card.querySelector("h3");
    const description = card.querySelector("p");
    const tag = card.querySelector("strong");

    modalImage.src = image.src;
    modalImage.alt = image.alt;
    modalTitle.textContent = title.textContent;
    modalDescription.textContent = description.textContent;
    modalTag.textContent = tag.textContent;
    modalIngredients.textContent = card.dataset.ingredients;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeProductModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  menuCards.forEach((card) => {
    card.querySelector(".card-action").addEventListener("click", () => openProductModal(card));
  });

  document.querySelectorAll("[data-close-modal]").forEach((item) => {
    item.addEventListener("click", closeProductModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeProductModal();
    }
  });

  const openStatusEl = document.querySelector("#open-status");
  if (openStatusEl) {
    const nowTR = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
    const minutes = nowTR.getHours() * 60 + nowTR.getMinutes();
    const isOpen = minutes >= 720 && minutes < 1380;
    openStatusEl.textContent = isOpen ? "Açık" : "Kapalı";
    openStatusEl.style.color = isOpen ? "#4ade80" : "#f87171";
  }

  const footerYear = document.querySelector("#footer-year");
  if (footerYear) footerYear.textContent = new Date().getFullYear();
}

init();
