import { CatalogToolbar } from "./CatalogToolbar";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "../common/EmptyState";

export function CatalogView({
  state,
  catalog,
  cart,
  actions,
}) {
  return (
    <>
      <CatalogToolbar
        filteredCount={catalog.filteredItems.length}
        search={state.search}
        onSearchChange={actions.setSearch}
        onSearchClear={() => actions.setSearch("")}
        activeCategory={state.activeCategory}
        onCategoryChange={actions.setActiveCategory}
        brand={state.brand}
        onBrandChange={actions.setBrand}
        brands={catalog.brands}
        inStockOnly={state.inStockOnly}
        onInStockOnlyChange={actions.setInStockOnly}
        onlyFavorites={state.onlyFavorites}
        onOnlyFavoritesChange={actions.setOnlyFavorites}
        maxPrice={state.maxPrice}
        onMaxPriceChange={actions.setMaxPrice}
        maxCatalogPrice={catalog.maxCatalogPrice}
        sortBy={state.sortBy}
        onSortChange={actions.setSortBy}
        sortOptions={catalog.sortOptions}
        onResetFilters={actions.resetCatalogFilters}
        categories={catalog.categories}
      />

      <section className="section">
        {catalog.filteredItems.length === 0 ? (
          <EmptyState
            title="Ничего не найдено"
            subtitle="Измените фильтры или текст запроса."
            action={
              <button className="btn btn--ghost" onClick={actions.resetCatalogFilters}>
                Сбросить всё
              </button>
            }
          />
        ) : (
          <div className="grid">
            {catalog.filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                qty={cart.qtyOf(item.id)}
                onOpen={actions.setProductModal}
                onAdd={actions.addToCart}
                onInc={actions.inc}
                onDec={actions.dec}
                onToggleFavorite={actions.toggleFavorite}
                isFavorite={catalog.favoriteSet.has(item.id)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
