import { BUNDLES, CATEGORIES, PRODUCTS, STORE } from "../../constants/catalog";
import { createStorefrontApi } from "../../api/storefrontApi";
import { createBrowserStorage } from "../../utils/storage";

function browserNotify(message) {
  if (typeof window !== "undefined") {
    window.alert(message);
  }
}

function browserOpenExternal(url) {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function createStorefrontDependencies(overrides = {}) {
  const storage = overrides.storage || createBrowserStorage();
  const api = { ...createStorefrontApi(storage), ...(overrides.api || {}) };
  const effects = {
    notify: browserNotify,
    openExternal: browserOpenExternal,
    ...(overrides.effects || {}),
  };

  return {
    store: overrides.store || STORE,
    categories: overrides.categories || CATEGORIES,
    items: overrides.items || [...PRODUCTS, ...BUNDLES],
    api,
    effects,
  };
}
