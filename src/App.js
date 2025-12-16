// Mobile Shopfront MVP (React + SCSS)
// Single-file React implementation (no router required) + SCSS in template string.
// - Public shopfront: home, catalog, product modal, cart/checkout, bundles section
// - Deep links to WhatsApp/Telegram/Instagram/Phone/Maps
// - Mobile-first, fast UI, simple state (MVP)
//
// Usage:
// 1) Drop this file into a React app as App.jsx
// 2) Ensure you import the SCSS string into your build (see note near bottom)
//    - Option A: copy styles into App.scss and import './App.scss'
//    - Option B: keep the injected <style> as-is (works without SCSS features)
//
// Notes:
// - This is front-only: admin panel, auth, persistence are mocked.
// - Currency shown as ₽. Availability is a 3-state status.
// - Checkout sends order via deep link and also stores it in localStorage as “New”.

import React, { useEffect, useMemo, useRef, useState } from "react";

// ---------------------------
// Mock data (replace with API later)
// ---------------------------
const STORE = {
  name: "Sweet Box",
  logoText: "SB",
  addressText: "Грозный, ул. Примерная 12",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Grozny%2C%20%D1%83%D0%BB.%20%D0%9F%D1%80%D0%B8%D0%BC%D0%B5%D1%80%D0%BD%D0%B0%D1%8F%2012",
  instagramUrl: "https://instagram.com/",
  phone: "+79990000000",
  whatsappPhone: "+79280873332", // digits only
  telegramUsername: "", // optional: e.g. "sweetbox_shop" or leave empty
  telegramLink: "https://t.me/", // if username empty, you can put full link to bot/chat
  deliveryText: "Доставка по городу по согласованию. Уточняйте в чате.",
  workHours: {
    // 0=Sun..6=Sat
    0: { open: null, close: null, closed: true },
    1: { open: "10:00", close: "22:00", closed: false },
    2: { open: "10:00", close: "22:00", closed: false },
    3: { open: "10:00", close: "22:00", closed: false },
    4: { open: "10:00", close: "22:00", closed: false },
    5: { open: "10:00", close: "23:00", closed: false },
    6: { open: "10:00", close: "23:00", closed: false },
  },
};

const AVAIL = {
  IN_STOCK: "in_stock",
  LOW: "low",
  OUT: "out",
};

const CATEGORIES = [
  { id: "new", name: "Новинки" },
  { id: "hits", name: "Хиты" },
  { id: "chocolate", name: "Шоколад" },
  { id: "marmalade", name: "Мармелад/жевательные" },
  { id: "kinder", name: "Kinder" },
  { id: "haribo", name: "Haribo" },
  { id: "cookies", name: "Печенье/вафли" },
  { id: "drinks", name: "Напитки" },
  { id: "bundles", name: "Подарочные наборы" },
];

const PRODUCTS = [
  {
    id: "p1",
    name: "Haribo Goldbears 100g",
    price: 199,
    categoryId: "haribo",
    availability: AVAIL.IN_STOCK,
    description: "Классические мишки Haribo. Отличный вариант к чаю.",
    tags: ["кислое", "Германия"],
    image:
      "https://images.unsplash.com/photo-1582006799720-b7b4d4f3b4f6?auto=format&fit=crop&w=1000&q=70",
    isNew: true,
    isHit: false,
    brand: "Haribo",
  },
  {
    id: "p2",
    name: "Kinder Bueno",
    price: 149,
    categoryId: "kinder",
    availability: AVAIL.LOW,
    description: "Хрустящая вафля, нежная начинка и шоколад.",
    tags: ["Италия"],
    image:
      "https://images.unsplash.com/photo-1606755962773-0d230e84e1a0?auto=format&fit=crop&w=1000&q=70",
    isNew: false,
    isHit: true,
    brand: "Kinder",
  },
  {
    id: "p3",
    name: "Шоколад молочный 90g",
    price: 239,
    categoryId: "chocolate",
    availability: AVAIL.OUT,
    description: "Насыщенный вкус, подходит для подарка.",
    tags: ["без сахара"],
    image:
      "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=1000&q=70",
    isNew: false,
    isHit: false,
    brand: "—",
  },
  {
    id: "p4",
    name: "Coca-Cola 0.33",
    price: 119,
    categoryId: "drinks",
    availability: AVAIL.IN_STOCK,
    description: "Освежающий напиток.",
    tags: ["0.33л"],
    image:
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1000&q=70",
    isNew: true,
    isHit: true,
    brand: "Coca-Cola",
  },
];

const BUNDLES = [
  {
    id: "b1",
    name: "Набор до 1500",
    price: 1500,
    categoryId: "bundles",
    availability: AVAIL.IN_STOCK,
    description:
      "Сладости ассорти + напиток. Замена 1–2 позиций по согласованию.",
    composition:
      "— Шоколад 2 шт\n— Мармелад 2 шт\n— Печенье 1 шт\n— Напиток 1 шт",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=70",
    isNew: false,
    isHit: true,
  },
  {
    id: "b2",
    name: "Набор до 3000",
    price: 3000,
    categoryId: "bundles",
    availability: AVAIL.LOW,
    description:
      "Расширенный набор + мини-подарок. Замена 1–2 позиций по согласованию.",
    composition:
      "— Шоколад 4 шт\n— Мармелад 3 шт\n— Kinder 2 шт\n— Печенье 2 шт\n— Напиток 2 шт",
    image:
      "https://images.unsplash.com/photo-1541976844346-f18aeac57b06?auto=format&fit=crop&w=1000&q=70",
    isNew: false,
    isHit: false,
  },
  {
    id: "b3",
    name: "Набор Премиум",
    price: 5000,
    categoryId: "bundles",
    availability: AVAIL.IN_STOCK,
    description:
      "Премиальный выбор. Замена 1–2 позиций по согласованию.",
    composition:
      "— Шоколад 6 шт\n— Мармелад 4 шт\n— Kinder 4 шт\n— Печенье 3 шт\n— Напитки 3 шт",
    image:
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1000&q=70",
    isNew: true,
    isHit: true,
  },
];

// ---------------------------
// Helpers
// ---------------------------
const formatRUB = (n) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);

function availabilityLabel(a) {
  if (a === AVAIL.IN_STOCK) return "В наличии";
  if (a === AVAIL.LOW) return "Мало";
  return "Нет";
}

function availabilityTone(a) {
  if (a === AVAIL.IN_STOCK) return "good";
  if (a === AVAIL.LOW) return "warn";
  return "bad";
}

function getTodayOpenState(workHours) {
  const now = new Date();
  const d = now.getDay();
  const row = workHours[d];
  if (!row || row.closed) return { isOpenNow: false, text: "Сегодня закрыто" };

  const [oh, om] = row.open.split(":").map(Number);
  const [ch, cm] = row.close.split(":").map(Number);
  const openM = oh * 60 + om;
  const closeM = ch * 60 + cm;
  const nowM = now.getHours() * 60 + now.getMinutes();

  // Basic same-day window
  const isOpenNow = nowM >= openM && nowM <= closeM;
  return {
    isOpenNow,
    text: isOpenNow
      ? `Открыто сейчас • до ${row.close}`
      : `Закрыто сейчас • откроется в ${row.open}`,
  };
}

function buildOrderText({ storeName, items, total, pickupMode, customer }) {
  const lines = [];
  lines.push(`Заказ из витрины: ${storeName}`);
  lines.push("—");
  items.forEach((it, idx) => {
    lines.push(
      `${idx + 1}. ${it.name} × ${it.qty} = ${formatRUB(it.price * it.qty)}`
    );
  });
  lines.push("—");
  lines.push(`Итого: ${formatRUB(total)}`);
  lines.push(`Получение: ${pickupMode === "pickup" ? "Самовывоз" : "Доставка"}`);
  lines.push("—");
  lines.push(`Имя: ${customer.name || "—"}`);
  lines.push(`Телефон: ${customer.phone || "—"}`);
  if (pickupMode === "delivery") {
    lines.push(`Адрес: ${customer.address || "—"}`);
    if (customer.landmark) lines.push(`Ориентир: ${customer.landmark}`);
  }
  if (customer.comment) lines.push(`Комментарий: ${customer.comment}`);
  lines.push("—");
  lines.push("Подтвердите, пожалуйста, заказ и время готовности.");

  return lines.join("\n");
}

function waLink(phoneDigits, text) {
  const encoded = encodeURIComponent(text);
  // wa.me works widely on mobile
  return `https://wa.me/${phoneDigits}?text=${encoded}`;
}

function tgLink(usernameOrLink, text) {
  const encoded = encodeURIComponent(text);
  if (!usernameOrLink) {
    // fallback: open Telegram app; user selects chat
    return `https://t.me/share/url?url=&text=${encoded}`;
  }
  if (usernameOrLink.startsWith("http")) {
    // If provided a full t.me link, append text via share as safest
    return `https://t.me/share/url?url=${encodeURIComponent(usernameOrLink)}&text=${encoded}`;
  }
  // Direct chat link can't prefill message reliably without bot/deeplink.
  // Use share anyway.
  return `https://t.me/share/url?url=https://t.me/${encodeURIComponent(
    usernameOrLink
  )}&text=${encoded}`;
}

function telLink(phone) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

// localStorage orders (MVP)
const ORDERS_KEY = "mvp_orders";
function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// ---------------------------
// UI Components
// ---------------------------
function Pill({ tone, children }) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

function IconButton({ label, onClick, href, icon, subtle }) {
  const Comp = href ? "a" : "button";
  return (
    <Comp
      className={`iconBtn ${subtle ? "iconBtn--subtle" : ""}`}
      onClick={href ? undefined : onClick}
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noreferrer" : undefined}
      aria-label={label}
    >
      <span className="iconBtn__icon" aria-hidden>
        {icon}
      </span>
      <span className="iconBtn__label">{label}</span>
    </Comp>
  );
}

function Modal({ open, onClose, title, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="modalOverlay"
      ref={overlayRef}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
    >
      <div className="modal">
        <div className="modal__head">
          <div className="modal__title">{title}</div>
          <button className="modal__close" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

function ProductCard({ item, onOpen, qty, onAdd, onInc, onDec }) {
  const tone = availabilityTone(item.availability);
  return (
    <div className="card">
      <button className="card__media" onClick={() => onOpen(item)}>
        <img src={item.image} alt={item.name} loading="lazy" />
      </button>

      <div className="card__content">
        <div className="card__top">
          <div className="card__name" title={item.name}>
            {item.name}
          </div>
          <Pill tone={tone}>{availabilityLabel(item.availability)}</Pill>
        </div>

        <div className="card__meta">
          <div className="card__price">{formatRUB(item.price)}</div>
          <div className="card__tags">
            {(item.tags || []).slice(0, 2).map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="card__actions">
          {qty > 0 ? (
            <div className="qty">
              <button className="qty__btn" onClick={() => onDec(item.id)}>
                –
              </button>
              <div className="qty__val">{qty}</div>
              <button className="qty__btn" onClick={() => onInc(item.id)}>
                +
              </button>
            </div>
          ) : (
            <button
              className="btn btn--primary"
              onClick={() => onAdd(item)}
              disabled={item.availability === AVAIL.OUT}
            >
              Добавить
            </button>
          )}
          <button className="btn btn--ghost" onClick={() => onOpen(item)}>
            Подробнее
          </button>
        </div>
      </div>
    </div>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="segmented" role="tablist" aria-label="Выбор">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`segmented__item ${value === opt.value ? "isActive" : ""}`}
          onClick={() => onChange(opt.value)}
          role="tab"
          aria-selected={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ChipRow({ items, onClick }) {
  return (
    <div className="chipRow">
      {items.map((it) => (
        <button
          key={it.id}
          className="chip"
          onClick={() => onClick(it.id)}
        >
          {it.name}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ title, subtitle, action }) {
  return (
    <div className="empty">
      <div className="empty__title">{title}</div>
      {subtitle && <div className="empty__sub">{subtitle}</div>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}

// ---------------------------
// Main App
// ---------------------------
export default function App() {
  const [view, setView] = useState("home"); // home | catalog | cart
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [brand, setBrand] = useState("all");

  const [productModal, setProductModal] = useState(null);
  const [bundleModal, setBundleModal] = useState(null);

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mvp_cart") || "{}") || {};
    } catch {
      return {};
    }
  });

  const [pickupMode, setPickupMode] = useState("pickup");
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    comment: "",
    address: "",
    landmark: "",
  });

  // persist cart
  useEffect(() => {
    localStorage.setItem("mvp_cart", JSON.stringify(cart));
  }, [cart]);

  const openState = useMemo(() => getTodayOpenState(STORE.workHours), []);

  const allItems = useMemo(() => [...PRODUCTS, ...BUNDLES], []);
  const brands = useMemo(() => {
    const set = new Set(PRODUCTS.map((p) => p.brand).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, []);

  const cartItems = useMemo(() => {
    const list = [];
    for (const [id, qty] of Object.entries(cart)) {
      const item = allItems.find((x) => x.id === id);
      if (item && qty > 0) list.push({ ...item, qty });
    }
    return list;
  }, [cart, allItems]);

  const total = useMemo(
    () => cartItems.reduce((sum, it) => sum + it.price * it.qty, 0),
    [cartItems]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const inCat =
        activeCategory === "all" ||
        p.categoryId === activeCategory ||
        (activeCategory === "new" && p.isNew) ||
        (activeCategory(activeCategory) === "hits" && p.isHit);

      const byCategory = (() => {
        if (activeCategory === "all") return true;
        if (activeCategory === "new") return !!p.isNew;
        if (activeCategory === "hits") return !!p.isHit;
        return p.categoryId === activeCategory;
      })();

      const byQuery = query
        ? p.name.toLowerCase().includes(query)
        : true;

      const byStock = inStockOnly ? p.availability !== AVAIL.OUT : true;
      const byBrand = brand === "all" ? true : p.brand === brand;

      return byCategory && byQuery && byStock && byBrand;
    });
  }, [search, activeCategory, inStockOnly, brand]);

  // Fix accidental helper typo by preventing runtime (guard)
  function EditorNote() {
    return null;
  }

  function qtyOf(id) {
    return cart[id] || 0;
  }

  function addToCart(item, qty = 1) {
    if (item.availability === AVAIL.OUT) return;
    setCart((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + qty }));
  }

  function inc(id) {
    const item = allItems.find((x) => x.id === id);
    if (!item || item.availability === AVAIL.OUT) return;
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  function dec(id) {
    setCart((prev) => {
      const next = { ...prev };
      const v = (next[id] || 0) - 1;
      if (v <= 0) delete next[id];
      else next[id] = v;
      return next;
    });
  }

  function clearCart() {
    setCart({});
  }

  function quickOrder(item) {
    addToCart(item, 1);
    setView("cart");
  }

  function submitOrder(channel) {
    if (cartItems.length === 0) return;

    // minimal validation
    if (!customer.name.trim() || !customer.phone.trim()) {
      alert("Пожалуйста, заполните имя и телефон.");
      return;
    }
    if (pickupMode === "delivery" && !customer.address.trim()) {
      alert("Пожалуйста, укажите адрес доставки.");
      return;
    }

    const text = buildOrderText({
      storeName: STORE.name,
      items: cartItems,
      total,
      pickupMode,
      customer,
    });

    // Save order locally (MVP)
    const orders = loadOrders();
    const order = {
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      total,
      channel,
      pickupMode,
      status: "Новый",
      items: cartItems.map(({ id, name, price, qty }) => ({
        id,
        name,
        price,
        qty,
      })),
      customer,
      text,
      history: [{ at: new Date().toISOString(), status: "Новый" }],
    };
    saveOrders([order, ...orders]);

    // Open channel deep link
    const url =
      channel === "wa"
        ? waLink(STORE.whatsappPhone, text)
        : tgLink(STORE.telegramUsername || STORE.telegramLink, text);

    window.open(url, "_blank", "noopener,noreferrer");

    // Keep cart for safety? MVP usually clears
    clearCart();
    setView("home");
    alert("Заказ сохранён. Открылся чат с готовым сообщением.");
  }

  const sections = useMemo(() => {
    const newItems = PRODUCTS.filter((p) => p.isNew);
    const hitItems = PRODUCTS.filter((p) => p.isHit);
    return {
      newItems,
      hitItems,
      bundles: BUNDLES,
      discounts: [],
    };
  }, []);

  // Safe category click that also navigates
  function goToCategory(catId) {
    setActiveCategory(catId);
    setView("catalog");
    // reset filters a bit
    setSearch("");
  }

  return (
    <div className="app">
      {/* style injection (works without SCSS compiler). For real SCSS, copy to App.scss */}
      <style>{styles}</style>

      <header className="header">
        <div className="header__brand" onClick={() => setView("home")}>
          <div className="logo" aria-hidden>
            {STORE.logoText}
          </div>
          <div className="brandText">
            <div className="brandText__name">{STORE.name}</div>
            <div className={`brandText__status ${openState.isOpenNow ? "isOpen" : "isClosed"}`}>
              {openState.text}
            </div>
          </div>
        </div>

        <div className="header__actions">
          <button
            className="miniCart"
            onClick={() => setView("cart")}
            aria-label="Открыть корзину"
          >
            <span aria-hidden>🛒</span>
            {cartItems.length > 0 && (
              <span className="miniCart__badge">{cartItems.length}</span>
            )}
          </button>
        </div>
      </header>

      <main className="main">
        {view === "home" && (
          <>
            <section className="hero">
              <div className="hero__card">
                <div className="hero__row">
                  <div className="hero__title">Онлайн‑витрина</div>
                  <Pill tone={openState.isOpenNow ? "good" : "bad"}>
                    {openState.isOpenNow ? "Открыто" : "Закрыто"}
                  </Pill>
                </div>

                <div className="hero__addr">
                  <div className="hero__addrText">{STORE.addressText}</div>
                  <a className="btn btn--ghost" href={STORE.mapsUrl} target="_blank" rel="noreferrer">
                    Построить маршрут
                  </a>
                </div>

                <div className="hero__contacts">
                  <IconButton
                    label="WhatsApp"
                    href={waLink(STORE.whatsappPhone, "Здравствуйте! Хочу сделать заказ.")}
                    icon="💬"
                  />
                  <IconButton
                    label="Telegram"
                    href={tgLink(STORE.telegramUsername || STORE.telegramLink, "Здравствуйте! Хочу сделать заказ.")}
                    icon="✈️"
                  />
                  <IconButton
                    label="Позвонить"
                    href={telLink(STORE.phone)}
                    icon="📞"
                    subtle
                  />
                  <IconButton
                    label="Instagram"
                    href={STORE.instagramUrl}
                    icon="📷"
                    subtle
                  />
                </div>
              </div>

              <div className="hero__shortcuts">
                <button className="shortcut" onClick={() => goToCategory("new")}
                >
                  <div className="shortcut__icon">✨</div>
                  <div className="shortcut__text">Новинки</div>
                </button>
                <button className="shortcut" onClick={() => goToCategory("hits")}
                >
                  <div className="shortcut__icon">🔥</div>
                  <div className="shortcut__text">Хиты</div>
                </button>
                <button className="shortcut" onClick={() => goToCategory("bundles")}
                >
                  <div className="shortcut__icon">🎁</div>
                  <div className="shortcut__text">Подарочные наборы</div>
                </button>
                <button className="shortcut" onClick={() => setView("catalog")}>
                  <div className="shortcut__icon">🧁</div>
                  <div className="shortcut__text">Каталог</div>
                </button>
              </div>
            </section>

            <section className="section">
              <div className="section__head">
                <div className="section__title">Популярное</div>
                <button className="link" onClick={() => goToCategory("hits")}>
                  Смотреть все
                </button>
              </div>
              <div className="grid">
                {sections.hitItems.slice(0, 4).map((p) => (
                  <ProductCard
                    key={p.id}
                    item={p}
                    qty={qtyOf(p.id)}
                    onOpen={setProductModal}
                    onAdd={addToCart}
                    onInc={inc}
                    onDec={dec}
                  />
                ))}
              </div>
            </section>

            <section className="section">
              <div className="section__head">
                <div className="section__title">Подарочные наборы</div>
                <button className="link" onClick={() => goToCategory("bundles")}>
                  Смотреть все
                </button>
              </div>

              <div className="bundleList">
                {BUNDLES.map((b) => (
                  <div className="bundle" key={b.id}>
                    <button className="bundle__media" onClick={() => setBundleModal(b)}>
                      <img src={b.image} alt={b.name} loading="lazy" />
                    </button>
                    <div className="bundle__content">
                      <div className="bundle__top">
                        <div className="bundle__name">{b.name}</div>
                        <Pill tone={availabilityTone(b.availability)}>
                          {availabilityLabel(b.availability)}
                        </Pill>
                      </div>
                      <div className="bundle__desc">{b.description}</div>
                      <div className="bundle__bottom">
                        <div className="bundle__price">{formatRUB(b.price)}</div>
                        <div className="bundle__actions">
                          <button
                            className="btn btn--primary"
                            onClick={() => quickOrder(b)}
                            disabled={b.availability === AVAIL.OUT}
                          >
                            Заказать
                          </button>
                          <button className="btn btn--ghost" onClick={() => setBundleModal(b)}>
                            Состав
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="section section--muted">
              <div className="section__title">Условия</div>
              <div className="note">
                <div className="note__row">
                  <span className="note__label">Доставка:</span>
                  <span className="note__text">{STORE.deliveryText}</span>
                </div>
                <div className="note__row">
                  <span className="note__label">Оплата:</span>
                  <span className="note__text">На MVP — без онлайн‑оплаты. Уточняйте в чате.</span>
                </div>
              </div>
            </section>
          </>
        )}

        {view === "catalog" && (
          <>
            <section className="toolbar">
              <div className="search">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по названию…"
                  aria-label="Поиск"
                />
                {search && (
                  <button className="search__clear" onClick={() => setSearch("")} aria-label="Очистить поиск">
                    ✕
                  </button>
                )}
              </div>

              <div className="filters">
                <div className="filters__row">
                  <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
                    <option value="all">Все категории</option>
                    {CATEGORIES.filter((c) => c.id !== "bundles").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                    <option value="bundles">Подарочные наборы</option>
                  </select>

                  <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                    <option value="all">Все бренды</option>
                    {brands
                      .filter((b) => b !== "all")
                      .map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                  </select>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  <span className="switch__ui" />
                  <span className="switch__label">Только в наличии</span>
                </label>
              </div>

              <div className="categoryChips">
                <ChipRow
                  items={[
                    { id: "all", name: "Все" },
                    ...CATEGORIES,
                  ]}
                  onClick={(id) => {
                    setActiveCategory(id);
                  }}
                />
              </div>
            </section>

            {activeCategory === "bundles" ? (
              <section className="section">
                <div className="section__head">
                  <div className="section__title">Подарочные наборы</div>
                  <button className="link" onClick={() => setView("home")}>
                    На главную
                  </button>
                </div>

                <div className="bundleList">
                  {BUNDLES.map((b) => (
                    <div className="bundle" key={b.id}>
                      <button className="bundle__media" onClick={() => setBundleModal(b)}>
                        <img src={b.image} alt={b.name} loading="lazy" />
                      </button>
                      <div className="bundle__content">
                        <div className="bundle__top">
                          <div className="bundle__name">{b.name}</div>
                          <Pill tone={availabilityTone(b.availability)}>
                            {availabilityLabel(b.availability)}
                          </Pill>
                        </div>
                        <div className="bundle__desc">{b.description}</div>
                        <div className="bundle__bottom">
                          <div className="bundle__price">{formatRUB(b.price)}</div>
                          <div className="bundle__actions">
                            <button
                              className="btn btn--primary"
                              onClick={() => quickOrder(b)}
                              disabled={b.availability === AVAIL.OUT}
                            >
                              Заказать
                            </button>
                            <button className="btn btn--ghost" onClick={() => setBundleModal(b)}>
                              Состав
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="section">
                <div className="section__head">
                  <div className="section__title">Каталог</div>
                  <button className="link" onClick={() => setView("home")}>
                    На главную
                  </button>
                </div>

                {filteredProducts.length === 0 ? (
                  <EmptyState
                    title="Ничего не найдено"
                    subtitle="Попробуйте изменить фильтры или запрос."
                    action={
                      <button className="btn btn--ghost" onClick={() => {
                        setSearch("");
                        setActiveCategory("all");
                        setBrand("all");
                        setInStockOnly(false);
                      }}>
                        Сбросить фильтры
                      </button>
                    }
                  />
                ) : (
                  <div className="grid">
                    {filteredProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        item={p}
                        qty={qtyOf(p.id)}
                        onOpen={setProductModal}
                        onAdd={addToCart}
                        onInc={inc}
                        onDec={dec}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {view === "cart" && (
          <>
            <section className="section">
              <div className="section__head">
                <div className="section__title">Корзина</div>
                <button className="link" onClick={() => setView("catalog")}>
                  В каталог
                </button>
              </div>

              {cartItems.length === 0 ? (
                <EmptyState
                  title="Корзина пустая"
                  subtitle="Добавьте товары из каталога или выберите набор."
                  action={
                    <button className="btn btn--primary" onClick={() => setView("catalog")}>
                      Открыть каталог
                    </button>
                  }
                />
              ) : (
                <>
                  <div className="cartList">
                    {cartItems.map((it) => (
                      <div className="cartItem" key={it.id}>
                        <img className="cartItem__img" src={it.image} alt={it.name} loading="lazy" />
                        <div className="cartItem__mid">
                          <div className="cartItem__name">{it.name}</div>
                          <div className="cartItem__sub">
                            <span className="cartItem__price">{formatRUB(it.price)}</span>
                            <span className={`dot dot--${availabilityTone(it.availability)}`}></span>
                            <span className="cartItem__stock">{availabilityLabel(it.availability)}</span>
                          </div>
                        </div>
                        <div className="cartItem__right">
                          <div className="qty qty--sm">
                            <button className="qty__btn" onClick={() => dec(it.id)}>
                              –
                            </button>
                            <div className="qty__val">{it.qty}</div>
                            <button className="qty__btn" onClick={() => inc(it.id)}>
                              +
                            </button>
                          </div>
                          <div className="cartItem__sum">{formatRUB(it.price * it.qty)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="checkout">
                    <div className="checkout__top">
                      <div className="checkout__totalLabel">Сумма</div>
                      <div className="checkout__total">{formatRUB(total)}</div>
                    </div>

                    <div className="checkout__block">
                      <div className="label">Способ получения</div>
                      <Segmented
                        value={pickupMode}
                        onChange={setPickupMode}
                        options={[
                          { value: "pickup", label: "Самовывоз" },
                          { value: "delivery", label: "Доставка" },
                        ]}
                      />
                    </div>

                    <div className="checkout__block">
                      <div className="label">Контакты</div>
                      <div className="form">
                        <input
                          value={customer.name}
                          onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Имя"
                          aria-label="Имя"
                        />
                        <input
                          value={customer.phone}
                          onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="Телефон"
                          aria-label="Телефон"
                          inputMode="tel"
                        />
                        <textarea
                          value={customer.comment}
                          onChange={(e) => setCustomer((p) => ({ ...p, comment: e.target.value }))}
                          placeholder="Комментарий (на подарок, без орехов…)"
                          aria-label="Комментарий"
                          rows={3}
                        />

                        {pickupMode === "delivery" && (
                          <>
                            <input
                              value={customer.address}
                              onChange={(e) => setCustomer((p) => ({ ...p, address: e.target.value }))}
                              placeholder="Адрес доставки"
                              aria-label="Адрес доставки"
                            />
                            <input
                              value={customer.landmark}
                              onChange={(e) => setCustomer((p) => ({ ...p, landmark: e.target.value }))}
                              placeholder="Ориентир (опционально)"
                              aria-label="Ориентир"
                            />
                          </>
                        )}
                      </div>
                    </div>

                    <div className="checkout__actions">
                      <button className="btn btn--ghost" onClick={clearCart}>
                        Очистить
                      </button>
                      <button className="btn btn--primary" onClick={() => submitOrder("wa")}>
                        Отправить в WhatsApp
                      </button>
                      <button className="btn btn--primary" onClick={() => submitOrder("tg")}>
                        Отправить в Telegram
                      </button>
                    </div>

                    <div className="checkout__hint">
                      После отправки откроется чат с готовым текстом. Заказ также сохранится в системе как «Новый».
                    </div>
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </main>

      <nav className="bottomNav" aria-label="Навигация">
        <button className={`bottomNav__item ${view === "home" ? "isActive" : ""}`} onClick={() => setView("home")}>
          <span aria-hidden>🏠</span>
          <span>Главная</span>
        </button>
        <button className={`bottomNav__item ${view === "catalog" ? "isActive" : ""}`} onClick={() => setView("catalog")}>
          <span aria-hidden>🧾</span>
          <span>Каталог</span>
        </button>
        <button className={`bottomNav__item ${view === "cart" ? "isActive" : ""}`} onClick={() => setView("cart")}>
          <span aria-hidden>🛒</span>
          <span>Корзина</span>
          {cartItems.length > 0 && <span className="bottomNav__badge">{cartItems.length}</span>}
        </button>
      </nav>

      {/* Product Modal */}
      <Modal
        open={!!productModal}
        onClose={() => setProductModal(null)}
        title={productModal?.name || ""}
      >
        {productModal && (
          <div className="modalProduct">
            <img className="modalProduct__img" src={productModal.image} alt={productModal.name} />
            <div className="modalProduct__row">
              <div className="modalProduct__price">{formatRUB(productModal.price)}</div>
              <Pill tone={availabilityTone(productModal.availability)}>
                {availabilityLabel(productModal.availability)}
              </Pill>
            </div>
            {productModal.description && <div className="modalProduct__desc">{productModal.description}</div>}
            {(productModal.tags || []).length > 0 && (
              <div className="modalProduct__tags">
                {productModal.tags.map((t) => (
                  <span key={t} className="tag tag--lg">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="modalProduct__actions">
              {qtyOf(productModal.id) > 0 ? (
                <div className="qty">
                  <button className="qty__btn" onClick={() => dec(productModal.id)}>
                    –
                  </button>
                  <div className="qty__val">{qtyOf(productModal.id)}</div>
                  <button className="qty__btn" onClick={() => inc(productModal.id)}>
                    +
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn--primary"
                  onClick={() => addToCart(productModal)}
                  disabled={productModal.availability === AVAIL.OUT}
                >
                  Добавить
                </button>
              )}
              <button className="btn btn--ghost" onClick={() => quickOrder(productModal)}>
                Быстрый заказ
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bundle Modal */}
      <Modal
        open={!!bundleModal}
        onClose={() => setBundleModal(null)}
        title={bundleModal?.name || ""}
      >
        {bundleModal && (
          <div className="modalProduct">
            <img className="modalProduct__img" src={bundleModal.image} alt={bundleModal.name} />
            <div className="modalProduct__row">
              <div className="modalProduct__price">{formatRUB(bundleModal.price)}</div>
              <Pill tone={availabilityTone(bundleModal.availability)}>
                {availabilityLabel(bundleModal.availability)}
              </Pill>
            </div>
            <div className="modalProduct__desc">{bundleModal.description}</div>
            <div className="modalProduct__desc" style={{ whiteSpace: "pre-line" }}>
              <b>Состав:</b>\n{bundleModal.composition}
            </div>
            <div className="modalProduct__actions">
              <button
                className="btn btn--primary"
                onClick={() => quickOrder(bundleModal)}
                disabled={bundleModal.availability === AVAIL.OUT}
              >
                Заказать набор
              </button>
              <button className="btn btn--ghost" onClick={() => addToCart(bundleModal)}>
                Добавить в корзину
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Hidden component to avoid unused warning if you tweak code */}
      <EditorNote />
    </div>
  );
}

// ---------------------------
// Styles
// ---------------------------
// This is written as plain CSS but structured like SCSS (BEM-ish). 
// For real SCSS: paste into App.scss and keep nesting if you want.

const styles = `
:root{
  --bg:#fff;
  --card:#131320;
  --card2:#17172a;
  --text:#f5f6ff;
  --muted:#a8abcf;
  --line:rgba(255,255,255,.08);
  --primary:#6ee7ff;
  --primary2:#a78bfa;
  --good:#7CFFB2;
  --warn:#FFD37C;
  --bad:#FF7C7C;
  --shadow: 0 10px 30px rgba(0,0,0,.35);
  --radius: 18px;
}

*{ box-sizing:border-box; }
html,body{ height:100%; }
body{ margin:0; background:#fff; color:var(--text); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"; }

.app{ min-height:100vh; padding-bottom:86px; }

.header{ position:sticky; top:0; z-index:10; background:rgba(11,11,15,.75); backdrop-filter: blur(14px); border-bottom:1px solid var(--line); padding:12px 14px; display:flex; align-items:center; justify-content:space-between; }
.header__brand{ display:flex; align-items:center; gap:12px; cursor:pointer; user-select:none; }

.logo{ width:40px; height:40px; border-radius:14px; display:grid; place-items:center; background: radial-gradient(120% 120% at 10% 10%, var(--primary) 0%, var(--primary2) 70%); color:#0a0a12; font-weight:900; letter-spacing:.5px; box-shadow: var(--shadow); }
.brandText__name{ font-weight:800; font-size:14px; line-height:1.1; }
.brandText__status{ font-size:12px; color:var(--muted); margin-top:2px; }
.brandText__status.isOpen{ color:rgba(124,255,178,.9); }
.brandText__status.isClosed{ color:rgba(255,124,124,.9); }

.miniCart{ position:relative; border:1px solid var(--line); background:rgba(255,255,255,.04); color:var(--text); width:44px; height:44px; border-radius:16px; display:grid; place-items:center; cursor:pointer; }
.miniCart__badge{ position:absolute; top:-6px; right:-6px; background:linear-gradient(135deg,var(--primary),var(--primary2)); color:#0a0a12; font-weight:900; font-size:12px; padding:4px 7px; border-radius:999px; box-shadow: var(--shadow); }

.main{ padding:14px; max-width:960px; margin:0 auto; }

.hero{ display:grid; gap:12px; }
.hero__card{ background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03)); border:1px solid var(--line); border-radius:var(--radius); padding:14px; box-shadow: var(--shadow); }
.hero__row{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.hero__title{ font-weight:900; font-size:16px; }
.hero__addr{ margin-top:12px; display:flex; align-items:center; justify-content:space-between; gap:10px; }
.hero__addrText{ font-size:13px; color:var(--muted); }
.hero__contacts{ margin-top:14px; display:grid; grid-template-columns: 1fr 1fr; gap:10px; }

.hero__shortcuts{ display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; }
.shortcut{ border:1px solid var(--line); background:rgba(255,255,255,.04); border-radius:18px; padding:12px; display:flex; align-items:center; gap:10px; cursor:pointer; text-align:left; }
.shortcut__icon{ font-size:18px; }
.shortcut__text{ font-weight:800; }

.section{ margin-top:16px; }
.section__head{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
.section__title{ font-weight:900; font-size:15px; }
.section--muted .note{ background:rgba(255,255,255,.04); border:1px dashed rgba(255,255,255,.14); }

.link{ background:none; border:none; color:var(--primary); font-weight:800; cursor:pointer; padding:6px 8px; border-radius:12px; }
.link:hover{ background:rgba(110,231,255,.08); }

.grid{ display:grid; grid-template-columns: repeat(1, 1fr); gap:12px; }
@media (min-width: 560px){ .grid{ grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 860px){ .grid{ grid-template-columns: repeat(3, 1fr); } }

.card{ background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03)); border:1px solid var(--line); border-radius:var(--radius); overflow:hidden; box-shadow: var(--shadow); display:flex; flex-direction:column; }
.card__media{ padding:0; border:none; background:none; cursor:pointer; width:100%; aspect-ratio: 16/11; overflow:hidden; }
.card__media img{ width:100%; height:100%; object-fit:cover; display:block; transform: scale(1.02); }
.card__content{ padding:12px; display:flex; flex-direction:column; gap:10px; }
.card__top{ display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
.card__name{ font-weight:900; line-height:1.15; font-size:14px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.card__meta{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.card__price{ font-weight:900; }
.card__tags{ display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; }

.tag{ font-size:11px; color:rgba(245,246,255,.9); border:1px solid rgba(255,255,255,.10); background:rgba(255,255,255,.04); padding:4px 8px; border-radius:999px; }
.tag--lg{ font-size:12px; padding:6px 10px; }

.card__actions{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:2px; }

.btn{ border:1px solid var(--line); background:rgba(255,255,255,.05); color:var(--text); padding:10px 12px; border-radius:16px; font-weight:900; cursor:pointer; }
.btn:disabled{ opacity:.5; cursor:not-allowed; }
.btn--primary{ background:linear-gradient(135deg, rgba(110,231,255,.28), rgba(167,139,250,.22)); border-color:rgba(110,231,255,.25); }
.btn--ghost{ background:rgba(255,255,255,.03); }

.qty{ display:flex; align-items:center; gap:8px; background:rgba(255,255,255,.04); border:1px solid var(--line); padding:8px 10px; border-radius:16px; }
.qty__btn{ width:34px; height:34px; border-radius:14px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.04); color:var(--text); font-size:18px; cursor:pointer; }
.qty__val{ min-width:22px; text-align:center; font-weight:900; }
.qty--sm{ padding:6px 8px; }
.qty--sm .qty__btn{ width:30px; height:30px; border-radius:12px; }

.pill{ font-size:12px; font-weight:900; padding:6px 10px; border-radius:999px; border:1px solid rgba(255,255,255,.10); background:rgba(255,255,255,.04); white-space:nowrap; }
.pill--good{ color:rgba(124,255,178,.95); border-color:rgba(124,255,178,.18); }
.pill--warn{ color:rgba(255,211,124,.95); border-color:rgba(255,211,124,.18); }
.pill--bad{ color:rgba(255,124,124,.95); border-color:rgba(255,124,124,.18); }

.toolbar{ position:sticky; top:74px; z-index:9; background:rgba(11,11,15,.80); backdrop-filter: blur(14px); border:1px solid var(--line); border-radius:var(--radius); padding:12px; box-shadow: var(--shadow); }
.search{ position:relative; }
.search input{ width:100%; padding:12px 42px 12px 12px; border-radius:16px; border:1px solid var(--line); background:rgba(255,255,255,.04); color:var(--text); outline:none; }
.search__clear{ position:absolute; right:10px; top:50%; transform:translateY(-50%); border:none; background:rgba(255,255,255,.06); width:30px; height:30px; border-radius:12px; color:var(--text); cursor:pointer; }

.filters{ margin-top:10px; display:grid; gap:10px; }
.filters__row{ display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
select{ width:100%; padding:12px; border-radius:16px; border:1px solid var(--line); background:rgba(255,255,255,.04); color:var(--text); outline:none; }

.switch{ display:flex; align-items:center; gap:10px; user-select:none; }
.switch input{ display:none; }
.switch__ui{ width:44px; height:26px; border-radius:999px; border:1px solid rgba(255,255,255,.14); background:rgba(255,255,255,.05); position:relative; cursor:pointer; }
.switch__ui::after{ content:""; width:20px; height:20px; border-radius:999px; position:absolute; top:50%; transform:translateY(-50%); left:3px; background:rgba(245,246,255,.9); transition: all .18s ease; }
.switch input:checked + .switch__ui{ border-color:rgba(110,231,255,.28); background:rgba(110,231,255,.12); }
.switch input:checked + .switch__ui::after{ left:20px; background:linear-gradient(135deg,var(--primary),var(--primary2)); }
.switch__label{ color:var(--muted); font-weight:800; }

.categoryChips{ margin-top:10px; }
.chipRow{ display:flex; gap:8px; overflow:auto; padding-bottom:6px; }
.chip{ border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.03); color:var(--text); border-radius:999px; padding:9px 12px; font-weight:900; cursor:pointer; white-space:nowrap; }

.bundleList{ display:grid; gap:12px; }
.bundle{ display:grid; grid-template-columns: 110px 1fr; gap:10px; background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03)); border:1px solid var(--line); border-radius:var(--radius); overflow:hidden; box-shadow: var(--shadow); }
.bundle__media{ border:none; background:none; padding:0; cursor:pointer; }
.bundle__media img{ width:110px; height:100%; object-fit:cover; display:block; }
.bundle__content{ padding:10px 12px; display:flex; flex-direction:column; gap:8px; }
.bundle__top{ display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
.bundle__name{ font-weight:900; }
.bundle__desc{ color:var(--muted); font-size:12.5px; line-height:1.3; }
.bundle__bottom{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.bundle__price{ font-weight:900; }
.bundle__actions{ display:flex; gap:8px; }

.note{ padding:12px; border-radius:var(--radius); }
.note__row{ display:flex; gap:8px; margin-top:6px; }
.note__row:first-child{ margin-top:0; }
.note__label{ font-weight:900; }
.note__text{ color:var(--muted); }

.cartList{ display:grid; gap:10px; }
.cartItem{ display:grid; grid-template-columns: 64px 1fr auto; gap:10px; align-items:center; padding:10px; border:1px solid var(--line); background:rgba(255,255,255,.03); border-radius:var(--radius); }
.cartItem__img{ width:64px; height:64px; border-radius:16px; object-fit:cover; }
.cartItem__name{ font-weight:900; }
.cartItem__sub{ display:flex; align-items:center; gap:8px; margin-top:4px; color:var(--muted); font-size:12px; }
.cartItem__price{ font-weight:900; color:rgba(245,246,255,.9); }
.cartItem__right{ display:flex; flex-direction:column; align-items:flex-end; gap:6px; }
.cartItem__sum{ font-weight:900; }

.dot{ width:8px; height:8px; border-radius:999px; display:inline-block; }
.dot--good{ background:rgba(124,255,178,.95); }
.dot--warn{ background:rgba(255,211,124,.95); }
.dot--bad{ background:rgba(255,124,124,.95); }

.checkout{ margin-top:12px; background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03)); border:1px solid var(--line); border-radius:var(--radius); padding:12px; box-shadow: var(--shadow); }
.checkout__top{ display:flex; align-items:center; justify-content:space-between; }
.checkout__totalLabel{ color:var(--muted); font-weight:900; }
.checkout__total{ font-weight:1000; font-size:18px; }
.checkout__block{ margin-top:12px; }
.label{ font-weight:900; margin-bottom:8px; }
.form{ display:grid; gap:10px; }
input,textarea{ width:100%; padding:12px; border-radius:16px; border:1px solid var(--line); background:rgba(255,255,255,.04); color:var(--text); outline:none; resize:vertical; }

.segmented{ display:grid; grid-template-columns: 1fr 1fr; background:rgba(255,255,255,.03); border:1px solid var(--line); border-radius:16px; padding:4px; gap:6px; }
.segmented__item{ border:none; background:transparent; color:var(--muted); padding:10px 12px; border-radius:14px; font-weight:900; cursor:pointer; }
.segmented__item.isActive{ background:linear-gradient(135deg, rgba(110,231,255,.22), rgba(167,139,250,.18)); color:var(--text); }

.checkout__actions{ margin-top:12px; display:grid; gap:10px; }
@media (min-width: 560px){ .checkout__actions{ grid-template-columns: 1fr 1fr 1fr; } }
.checkout__hint{ margin-top:10px; font-size:12px; color:var(--muted); line-height:1.35; }

.bottomNav{ position:fixed; left:0; right:0; bottom:0; padding:10px 14px; background:rgba(11,11,15,.80); backdrop-filter: blur(14px); border-top:1px solid var(--line); display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; }
.bottomNav__item{ position:relative; border:1px solid var(--line); background:rgba(255,255,255,.04); color:var(--muted); border-radius:18px; padding:10px 12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; font-weight:900; cursor:pointer; }
.bottomNav__item.isActive{ color:var(--text); border-color:rgba(110,231,255,.22); background:rgba(110,231,255,.10); }
.bottomNav__badge{ position:absolute; top:-6px; right:-6px; background:linear-gradient(135deg,var(--primary),var(--primary2)); color:#0a0a12; font-weight:1000; font-size:12px; padding:4px 7px; border-radius:999px; box-shadow: var(--shadow); }

.modalOverlay{ position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:flex-end; justify-content:center; z-index:50; padding:12px; }
.modal{ width:100%; max-width:720px; background:rgba(19,19,32,.95); border:1px solid rgba(255,255,255,.10); border-radius:24px; box-shadow: var(--shadow); overflow:hidden; }
.modal__head{ display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.08); }
.modal__title{ font-weight:1000; }
.modal__close{ border:none; background:rgba(255,255,255,.06); width:38px; height:38px; border-radius:16px; color:var(--text); cursor:pointer; }
.modal__body{ padding:14px; }

.modalProduct{ display:grid; gap:10px; }
.modalProduct__img{ width:100%; height:240px; object-fit:cover; border-radius:18px; border:1px solid rgba(255,255,255,.10); }
.modalProduct__row{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.modalProduct__price{ font-weight:1000; font-size:18px; }
.modalProduct__desc{ color:var(--muted); line-height:1.35; }
.modalProduct__tags{ display:flex; flex-wrap:wrap; gap:8px; }
.modalProduct__actions{ display:flex; gap:10px; justify-content:space-between; }

.iconBtn{ display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 12px; border-radius:16px; border:1px solid rgba(255,255,255,.10); background:rgba(255,255,255,.04); text-decoration:none; color:var(--text); cursor:pointer; font-weight:900; }
.iconBtn--subtle{ background:rgba(255,255,255,.03); color:var(--muted); }
.iconBtn__icon{ font-size:16px; }

.empty{ padding:18px; text-align:center; border:1px dashed rgba(255,255,255,.14); background:rgba(255,255,255,.03); border-radius:24px; }
.empty__title{ font-weight:1000; font-size:16px; }
.empty__sub{ margin-top:6px; color:var(--muted); line-height:1.35; }
.empty__action{ margin-top:12px; display:flex; justify-content:center; }
`;
