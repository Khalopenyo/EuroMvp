import { formatRUB } from "../../utils/format";

const AVAIL_IN_STOCK = "in_stock";
const AVAIL_LOW = "low";
const AVAIL_OUT = "out";

export function availabilityLabel(availability) {
  if (availability === AVAIL_IN_STOCK) return "В наличии";
  if (availability === AVAIL_LOW) return "Мало";
  return "Нет";
}

export function availabilityTone(availability) {
  if (availability === AVAIL_IN_STOCK) return "good";
  if (availability === AVAIL_LOW) return "warn";
  return "bad";
}

export function isOutOfStock(availability) {
  return availability === AVAIL_OUT;
}

export function getTodayOpenState(workHours) {
  const now = new Date();
  const weekday = now.getDay();
  const schedule = workHours[weekday];

  if (!schedule || schedule.closed) {
    return { isOpenNow: false, text: "Сегодня закрыто" };
  }

  const [openHour, openMinute] = schedule.open.split(":").map(Number);
  const [closeHour, closeMinute] = schedule.close.split(":").map(Number);

  const openAtMinutes = openHour * 60 + openMinute;
  const closeAtMinutes = closeHour * 60 + closeMinute;
  const nowAtMinutes = now.getHours() * 60 + now.getMinutes();

  const isOpenNow = nowAtMinutes >= openAtMinutes && nowAtMinutes <= closeAtMinutes;

  return {
    isOpenNow,
    text: isOpenNow
      ? `Открыто сейчас • до ${schedule.close}`
      : `Закрыто сейчас • откроется в ${schedule.open}`,
  };
}

export function buildItemIndex(items) {
  return items.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

export function getCatalogBrands(items) {
  const set = new Set(items.map((item) => item.brand).filter(Boolean));
  return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b, "ru"))];
}

export function getMaxCatalogPrice(items) {
  return items.reduce((max, item) => Math.max(max, item.price), 0);
}

export function getCartItems(cart, itemById) {
  const list = [];

  for (const [id, qty] of Object.entries(cart)) {
    const item = itemById[id];
    if (item && qty > 0) list.push({ ...item, qty });
  }

  return list;
}

export function getCartUnits(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.qty, 0);
}

export function getCartTotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getPopularityScore(item) {
  let score = 0;
  if (item.isHit) score += 3;
  if (item.isNew) score += 2;
  if (!isOutOfStock(item.availability)) score += 1;
  return score;
}

function sortItems(items, sortBy) {
  return items.sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "name") return a.name.localeCompare(b.name, "ru");

    const score = getPopularityScore(b) - getPopularityScore(a);
    if (score !== 0) return score;
    return a.price - b.price;
  });
}

function hasCategory(item, activeCategory) {
  if (activeCategory === "all") return true;
  if (activeCategory === "new") return !!item.isNew;
  if (activeCategory === "hits") return !!item.isHit;
  return item.categoryId === activeCategory;
}

function hasQuery(item, query) {
  if (!query) return true;

  const searchBase = [
    item.name,
    item.description,
    item.brand,
    item.composition,
    ...(item.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchBase.includes(query);
}

export function getFilteredItems({
  items,
  activeCategory,
  query,
  inStockOnly,
  brand,
  maxPrice,
  onlyFavorites,
  favoriteSet,
  sortBy,
}) {
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = items.filter((item) => {
    const byCategory = hasCategory(item, activeCategory);
    const byQuery = hasQuery(item, normalizedQuery);
    const byStock = inStockOnly ? !isOutOfStock(item.availability) : true;
    const byBrand = brand === "all" ? true : item.brand === brand;
    const byPrice = maxPrice ? item.price <= maxPrice : true;
    const byFavorite = onlyFavorites ? favoriteSet.has(item.id) : true;

    return byCategory && byQuery && byStock && byBrand && byPrice && byFavorite;
  });

  return sortItems(filtered, sortBy);
}

export function getHomeSections(items) {
  return {
    featured: items.filter((item) => item.isHit || item.isNew).slice(0, 8),
    bundles: items.filter((item) => item.categoryId === "bundles").slice(0, 4),
  };
}

export function validateOrderInput({
  cartItems,
  customer,
  pickupMode,
  total,
  minDeliveryOrder,
}) {
  if (cartItems.length === 0) return "Корзина пустая.";
  if (!customer.name.trim() || !customer.phone.trim()) {
    return "Пожалуйста, заполните имя и телефон.";
  }
  if (!/[\d+][\d\s()-]{7,}/.test(customer.phone.trim())) {
    return "Проверьте формат телефона.";
  }
  if (pickupMode === "delivery" && !customer.address.trim()) {
    return "Пожалуйста, укажите адрес доставки.";
  }
  if (pickupMode === "delivery" && total < minDeliveryOrder) {
    return `Для доставки минимальная сумма заказа ${formatRUB(minDeliveryOrder)}.`;
  }

  return null;
}

export function buildOrderText({ storeName, items, total, pickupMode, customer }) {
  const lines = [`Заказ из витрины: ${storeName}`, "—"];

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} × ${item.qty} = ${formatRUB(item.price * item.qty)}`);
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

export function createOrderRecord({ channel, total, pickupMode, customer, cartItems, text }) {
  return {
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
}

export function waLink(phoneDigits, text) {
  const sanitizedPhone = String(phoneDigits || "").replace(/\D/g, "");
  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(text)}`;
}

export function tgLink(usernameOrLink, text) {
  const encodedText = encodeURIComponent(text);

  if (!usernameOrLink) {
    return `https://t.me/share/url?url=&text=${encodedText}`;
  }

  if (usernameOrLink.startsWith("http")) {
    return `https://t.me/share/url?url=${encodeURIComponent(usernameOrLink)}&text=${encodedText}`;
  }

  return `https://t.me/share/url?url=https://t.me/${encodeURIComponent(usernameOrLink)}&text=${encodedText}`;
}
