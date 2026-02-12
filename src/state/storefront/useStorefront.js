import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_CUSTOMER,
  ORDER_CHANNEL,
  SORT_OPTIONS,
} from "./constants";
import {
  buildItemIndex,
  buildOrderText,
  createOrderRecord,
  getCartItems,
  getCartTotal,
  getCartUnits,
  getCatalogBrands,
  getFilteredItems,
  getHomeSections,
  getMaxCatalogPrice,
  getTodayOpenState,
  isOutOfStock,
  tgLink,
  validateOrderInput,
  waLink,
} from "./logic";

const NOOP = () => {};

const EMPTY_STORE = {
  name: "",
  workHours: {},
  minDeliveryOrder: 0,
  whatsappPhone: "",
  telegramUsername: "",
  telegramLink: "",
};

const EMPTY_API = {
  getCart: () => ({}),
  getFavorites: () => [],
  saveCart: NOOP,
  saveFavorites: NOOP,
  prependOrder: NOOP,
};

const EMPTY_EFFECTS = {
  notify: NOOP,
  openExternal: NOOP,
};

function cloneDefaultCustomer() {
  return { ...DEFAULT_CUSTOMER };
}

export function useStorefront(dependencies) {
  const {
    store = EMPTY_STORE,
    categories = [],
    items = [],
    api = {},
    effects = {},
  } = dependencies || {};

  const apiDeps = { ...EMPTY_API, ...(api || {}) };
  const effectsDeps = { ...EMPTY_EFFECTS, ...(effects || {}) };

  const { getCart, getFavorites, saveCart, saveFavorites, prependOrder } = apiDeps;
  const { notify, openExternal } = effectsDeps;

  const [view, setView] = useState("home");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [brand, setBrand] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const [productModal, setProductModal] = useState(null);
  const [pickupMode, setPickupMode] = useState("pickup");
  const [customer, setCustomer] = useState(cloneDefaultCustomer);

  const [cart, setCart] = useState(() => getCart());
  const [favorites, setFavorites] = useState(() => getFavorites());

  const allItems = useMemo(() => items, [items]);
  const itemById = useMemo(() => buildItemIndex(allItems), [allItems]);

  useEffect(() => {
    saveCart(cart);
  }, [cart, saveCart]);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites, saveFavorites]);

  const openState = useMemo(() => getTodayOpenState(store.workHours || {}), [store.workHours]);
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const brands = useMemo(() => getCatalogBrands(allItems), [allItems]);
  const maxCatalogPrice = useMemo(() => getMaxCatalogPrice(allItems), [allItems]);

  const [maxPrice, setMaxPrice] = useState(0);

  useEffect(() => {
    setMaxPrice(maxCatalogPrice);
  }, [maxCatalogPrice]);

  const cartItems = useMemo(() => getCartItems(cart, itemById), [cart, itemById]);
  const cartUnits = useMemo(() => getCartUnits(cartItems), [cartItems]);
  const total = useMemo(() => getCartTotal(cartItems), [cartItems]);

  const filteredItems = useMemo(
    () =>
      getFilteredItems({
        items: allItems,
        activeCategory,
        query: search,
        inStockOnly,
        brand,
        maxPrice,
        onlyFavorites,
        favoriteSet,
        sortBy,
      }),
    [
      activeCategory,
      allItems,
      brand,
      favoriteSet,
      inStockOnly,
      maxPrice,
      onlyFavorites,
      search,
      sortBy,
    ]
  );

  const homeSections = useMemo(() => getHomeSections(allItems), [allItems]);

  function qtyOf(id) {
    return cart[id] || 0;
  }

  function addToCart(item, qty = 1) {
    if (isOutOfStock(item.availability)) return;
    setCart((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + qty }));
  }

  function inc(id) {
    const item = itemById[id];
    if (!item || isOutOfStock(item.availability)) return;
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  function dec(id) {
    setCart((prev) => {
      const next = { ...prev };
      const value = (next[id] || 0) - 1;
      if (value <= 0) delete next[id];
      else next[id] = value;
      return next;
    });
  }

  function removeFromCart(id) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
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

  function toggleFavorite(id) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [id, ...prev]
    );
  }

  function goToCategory(categoryId) {
    setActiveCategory(categoryId);
    setView("home");
    setSearch("");
  }

  function resetCatalogFilters() {
    setSearch("");
    setActiveCategory("all");
    setInStockOnly(false);
    setOnlyFavorites(false);
    setBrand("all");
    setSortBy("popular");
    setMaxPrice(maxCatalogPrice);
  }

  function setCustomerField(field, value) {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  }

  function submitOrder(channel) {
    const error = validateOrderInput({
      cartItems,
      customer,
      pickupMode,
      total,
      minDeliveryOrder: store.minDeliveryOrder,
    });

    if (error) {
      notify(error);
      return;
    }

    const text = buildOrderText({
      storeName: store.name,
      items: cartItems,
      total,
      pickupMode,
      customer,
    });

    const order = createOrderRecord({
      channel,
      total,
      pickupMode,
      customer,
      cartItems,
      text,
    });

    prependOrder(order);

    const url =
      channel === ORDER_CHANNEL.WHATSAPP
        ? waLink(store.whatsappPhone, text)
        : tgLink(store.telegramUsername || store.telegramLink, text);

    openExternal(url);

    clearCart();
    setCustomer(cloneDefaultCustomer());
    setPickupMode("pickup");
    setView("home");

    notify("Заказ сохранён и открыт в выбранном мессенджере.");
  }

  return {
    state: {
      view,
      activeCategory,
      search,
      inStockOnly,
      onlyFavorites,
      brand,
      sortBy,
      maxPrice,
      pickupMode,
      customer,
      productModal,
    },
    catalog: {
      allItems,
      filteredItems,
      brands,
      maxCatalogPrice,
      homeSections,
      favoriteSet,
      openState,
      categories,
      sortOptions: SORT_OPTIONS,
    },
    cart: {
      cartItems,
      cartUnits,
      total,
      qtyOf,
    },
    actions: {
      setView,
      setActiveCategory,
      setSearch,
      setInStockOnly,
      setOnlyFavorites,
      setBrand,
      setSortBy,
      setMaxPrice,
      setPickupMode,
      setCustomerField,
      setProductModal,
      addToCart,
      inc,
      dec,
      removeFromCart,
      clearCart,
      quickOrder,
      toggleFavorite,
      goToCategory,
      resetCatalogFilters,
      submitOrder,
    },
    meta: {
      store,
    },
  };
}
