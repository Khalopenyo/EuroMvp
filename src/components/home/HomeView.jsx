import { formatRUB } from "../../utils/format";
import { HOME_CATEGORY_SHORTCUTS } from "../../state/storefront/constants";
import { ChipRow } from "../common/ChipRow";
import { ProductCard } from "../catalog/ProductCard";

export function HomeView({
  homeSections,
  qtyOf,
  onOpenItem,
  onAddToCart,
  onInc,
  onDec,
  onToggleFavorite,
  favoriteSet,
  onGoToCategory,
  onOpenCatalog,
  store,
}) {
  return (
    <>
      <section className="section">
        <div className="section__head">
          <div>
            <div className="section__title">Категории</div>
            <div className="section__sub">Быстрый переход в нужный раздел каталога</div>
          </div>
          <button className="link" onClick={onOpenCatalog}>
            К каталогу
          </button>
        </div>

        <div className="categoryChips">
          <ChipRow items={HOME_CATEGORY_SHORTCUTS} activeId={null} onClick={onGoToCategory} />
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <div className="section__title">Рекомендуем</div>
            <div className="section__sub">Популярные позиции и последние поступления</div>
          </div>
          <button className="link" onClick={() => onGoToCategory("hits")}>
            Смотреть все
          </button>
        </div>

        <div className="grid">
          {homeSections.featured.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              qty={qtyOf(item.id)}
              onOpen={onOpenItem}
              onAdd={onAddToCart}
              onInc={onInc}
              onDec={onDec}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favoriteSet.has(item.id)}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <div className="section__title">Подарочные наборы</div>
            <div className="section__sub">Готовые решения для подарка и праздника</div>
          </div>
          <button className="link" onClick={() => onGoToCategory("bundles")}>
            Смотреть все
          </button>
        </div>

        <div className="grid">
          {homeSections.bundles.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              qty={qtyOf(item.id)}
              onOpen={onOpenItem}
              onAdd={onAddToCart}
              onInc={onInc}
              onDec={onDec}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favoriteSet.has(item.id)}
            />
          ))}
        </div>
      </section>

      <section className="section section--muted">
        <div className="section__head">
          <div>
            <div className="section__title">Условия заказа</div>
            <div className="section__sub">Коротко и по делу</div>
          </div>
        </div>

        <div className="note">
          <div className="note__row">
            <span className="note__label">Доставка:</span>
            <span className="note__text">{store.deliveryText}</span>
          </div>
          <div className="note__row">
            <span className="note__label">Минимум:</span>
            <span className="note__text">для доставки от {formatRUB(store.minDeliveryOrder)}</span>
          </div>
          <div className="note__row">
            <span className="note__label">Оплата:</span>
            <span className="note__text">{store.paymentText}</span>
          </div>
        </div>
      </section>
    </>
  );
}
