const NOOP = () => {};
const READ_NULL = () => null;

function safeRawStorage(rawStorage) {
  return {
    getItem:
      rawStorage && typeof rawStorage.getItem === "function"
        ? rawStorage.getItem.bind(rawStorage)
        : READ_NULL,
    setItem:
      rawStorage && typeof rawStorage.setItem === "function"
        ? rawStorage.setItem.bind(rawStorage)
        : NOOP,
  };
}

function safeParse(raw, fallbackValue) {
  if (typeof raw !== "string") return fallbackValue;

  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function createStorage(rawStorage) {
  const storage = safeRawStorage(rawStorage);

  function read(key, fallbackValue) {
    try {
      return safeParse(storage.getItem(key), fallbackValue);
    } catch {
      return fallbackValue;
    }
  }

  return {
    readObject(key) {
      const value = read(key, {});
      return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
    },
    readArray(key) {
      const value = read(key, []);
      return Array.isArray(value) ? value : [];
    },
    write(key, value) {
      try {
        storage.setItem(key, JSON.stringify(value));
      } catch {
        NOOP();
      }
    },
  };
}

export function createBrowserStorage() {
  if (typeof window === "undefined") {
    return createStorage(null);
  }

  return createStorage(window.localStorage);
}

export function createMemoryStorage(seed = {}) {
  const bucket = {};

  for (const [key, value] of Object.entries(seed)) {
    bucket[key] = typeof value === "string" ? value : JSON.stringify(value);
  }

  return createStorage({
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(bucket, key) ? bucket[key] : null;
    },
    setItem(key, value) {
      bucket[key] = String(value);
    },
  });
}
