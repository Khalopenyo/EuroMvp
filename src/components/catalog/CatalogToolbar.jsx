import { useState } from "react";
import { formatRUB } from "../../utils/format";

function clampMaxPrice(value, maxCatalogPrice) {
  const upperBound = Math.max(99, maxCatalogPrice || 0);
  if (!Number.isFinite(value)) return upperBound;
  return Math.min(Math.max(99, value), upperBound);
}

export function CatalogToolbar({
  filteredCount,
  search,
  onSearchChange,
  onSearchClear,
  activeCategory,
  onCategoryChange,
  brand,
  onBrandChange,
  brands,
  inStockOnly,
  onInStockOnlyChange,
  onlyFavorites,
  onOnlyFavoritesChange,
  maxPrice,
  onMaxPriceChange,
  maxCatalogPrice,
  sortBy,
  onSortChange,
  sortOptions,
  onResetFilters,
  categories,
}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const categoryOptions = [{ id: "all", name: "Все категории" }, ...(categories || [])];
  const brandOptions = ["all", ...(brands || []).filter((value) => value !== "all")];
  const safeMaxPrice = clampMaxPrice(maxPrice, maxCatalogPrice);
  const activeFiltersCount =
    Number(activeCategory !== "all") +
    Number(brand !== "all") +
    Number(inStockOnly) +
    Number(onlyFavorites) +
    Number(sortBy !== "popular") +
    Number(safeMaxPrice < Math.max(99, maxCatalogPrice || 0));

  function handleResetFilters() {
    onResetFilters();
    setMobileFiltersOpen(false);
  }

  return (
    <div className="catalogControls">
      <div className="catalogHeader">
        <div className="catalogHeader__lead">
          <div className="catalogHeader__title">Каталог</div>
          <div className="catalogHeader__meta">Найдено: {filteredCount}</div>
        </div>
      </div>

      <div className="catalogFilters">
        <div className="catalogFilters__search search">
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Поиск по названию или бренду"
            aria-label="Поиск"
          />
          {search && (
            <button className="search__clear" onClick={onSearchClear} aria-label="Очистить">
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          className="catalogFilters__toggle"
          aria-expanded={mobileFiltersOpen}
          aria-controls="catalog-filters-panel"
          onClick={() => setMobileFiltersOpen((prev) => !prev)}
        >
          <span>Фильтры{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}</span>
          <span>{mobileFiltersOpen ? "Скрыть ▲" : "Показать ▼"}</span>
        </button>

        <div
          id="catalog-filters-panel"
          className={`catalogFilters__panel ${mobileFiltersOpen ? "isOpen" : ""}`}
        >
          <div className="catalogFilters__row catalogFilters__row--three">
            <label className="field">
              <span className="field__label">Категория</span>
              <select value={activeCategory} onChange={(event) => onCategoryChange(event.target.value)}>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field__label">Бренд</span>
              <select value={brand} onChange={(event) => onBrandChange(event.target.value)}>
                {brandOptions.map((value) => (
                  <option key={value} value={value}>
                    {value === "all" ? "Все бренды" : value}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field__label">Сортировка</span>
              <select value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="catalogFilters__row catalogFilters__row--three">
            <label className="field">
              <span className="field__label">Цена до</span>
              <input
                type="number"
                min="99"
                max={Math.max(99, maxCatalogPrice)}
                step="10"
                value={safeMaxPrice}
                onChange={(event) =>
                  onMaxPriceChange(clampMaxPrice(Number(event.target.value), maxCatalogPrice))
                }
                aria-label="Максимальная цена"
              />
              <span className="field__hint">{formatRUB(safeMaxPrice)}</span>
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) => onInStockOnlyChange(event.target.checked)}
              />
              <span>Только в наличии</span>
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={onlyFavorites}
                onChange={(event) => onOnlyFavoritesChange(event.target.checked)}
              />
              <span>Только избранное</span>
            </label>
          </div>

          <div className="catalogFilters__actions">
            <button className="btn btn--ghost" onClick={handleResetFilters}>
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
