export const SORT_OPTIONS = [
  { value: "popular", label: "Сначала популярные" },
  { value: "price_asc", label: "Сначала дешевле" },
  { value: "price_desc", label: "Сначала дороже" },
  { value: "name", label: "По названию" },
];

export const DEFAULT_CUSTOMER = {
  name: "",
  phone: "",
  comment: "",
  address: "",
  landmark: "",
};

export const HOME_CATEGORY_SHORTCUTS = [
  { id: "hits", name: "Хиты" },
  { id: "new", name: "Новинки" },
  { id: "chocolate", name: "Шоколад" },
  { id: "kinder", name: "Kinder" },
  { id: "haribo", name: "Haribo" },
  { id: "cookies", name: "Печенье" },
  { id: "drinks", name: "Напитки" },
  { id: "bundles", name: "Наборы" },
];

export const ORDER_CHANNEL = {
  WHATSAPP: "wa",
  TELEGRAM: "tg",
};
