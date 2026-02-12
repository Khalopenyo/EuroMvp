import { CART_KEY, FAVORITES_KEY, ORDERS_KEY } from "../constants/catalog";
import { createBrowserStorage } from "../utils/storage";

const EMPTY_STORAGE = {
  readObject: () => ({}),
  readArray: () => [],
  write: () => {},
};

function normalizeStorage(storage) {
  return {
    readObject:
      storage && typeof storage.readObject === "function"
        ? storage.readObject.bind(storage)
        : EMPTY_STORAGE.readObject,
    readArray:
      storage && typeof storage.readArray === "function"
        ? storage.readArray.bind(storage)
        : EMPTY_STORAGE.readArray,
    write:
      storage && typeof storage.write === "function"
        ? storage.write.bind(storage)
        : EMPTY_STORAGE.write,
  };
}

export function createStorefrontApi(storage = createBrowserStorage()) {
  const jsonStorage = normalizeStorage(storage);

  return {
    getCart() {
      return jsonStorage.readObject(CART_KEY);
    },
    saveCart(cart) {
      jsonStorage.write(CART_KEY, cart);
    },
    getFavorites() {
      return jsonStorage
        .readArray(FAVORITES_KEY)
        .filter((value) => typeof value === "string");
    },
    saveFavorites(favorites) {
      jsonStorage.write(FAVORITES_KEY, favorites);
    },
    getOrders() {
      return jsonStorage.readArray(ORDERS_KEY);
    },
    prependOrder(order) {
      const orders = jsonStorage.readArray(ORDERS_KEY);
      jsonStorage.write(ORDERS_KEY, [order, ...orders]);
      return order;
    },
  };
}
