import { formatRUB } from "../../utils/format";
import {
  availabilityLabel,
  availabilityTone,
  isOutOfStock,
} from "../../state/storefront/logic";
import { Pill } from "../common/Pill";

function getCardBadge(item) {
  if (item.isHit) return { className: "badge badge--accent", label: "Хит" };
  if (item.isNew) return { className: "badge", label: "Новинка" };
  if (item.categoryId === "bundles") return { className: "badge badge--soft", label: "Набор" };
  return { className: "badge badge--soft", label: "Товар" };
}

export function ProductCard({
  item,
  qty,
  onOpen,
  onAdd,
  onInc,
  onDec,
  onToggleFavorite,
  isFavorite,
}) {
  const tone = availabilityTone(item.availability);
  const badge = getCardBadge(item);

  return (
    <div className="card">
      <button className="card__media" onClick={() => onOpen(item)}>
        <img src={item.image} alt={item.name} loading="lazy" />
      </button>

      <div className="card__content">
        <div className="card__flags">
          <span className={badge.className}>{badge.label}</span>
          <button
            className={`favBtn ${isFavorite ? "isActive" : ""}`}
            aria-label="Добавить в избранное"
            onClick={() => onToggleFavorite(item.id)}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        </div>

        <div className="card__top">
          <div className="card__name" title={item.name}>
            {item.name}
          </div>
          <Pill tone={tone}>{availabilityLabel(item.availability)}</Pill>
        </div>

        {item.description && <div className="card__desc">{item.description}</div>}

        <div className="card__meta">
          <div className="card__price">{formatRUB(item.price)}</div>
          <div className="card__tags">
            {(item.tags || []).slice(0, 2).map((tag) => (
              <span key={tag} className="tag">
                {tag}
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
              disabled={isOutOfStock(item.availability)}
            >
              В корзину
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
