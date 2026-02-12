import {
  availabilityLabel,
  availabilityTone,
  isOutOfStock,
} from "../../state/storefront/logic";
import { formatRUB } from "../../utils/format";
import { Pill } from "../common/Pill";

export function ProductModalContent({ item, qty, onInc, onDec, onAdd, onQuickOrder }) {
  return (
    <div className="modalProduct">
      <img className="modalProduct__img" src={item.image} alt={item.name} />

      <div className="modalProduct__row">
        <div className="modalProduct__price">{formatRUB(item.price)}</div>
        <Pill tone={availabilityTone(item.availability)}>{availabilityLabel(item.availability)}</Pill>
      </div>

      {item.brand && <div className="modalProduct__brand">Бренд: {item.brand}</div>}

      {item.description && <div className="modalProduct__desc">{item.description}</div>}

      {item.composition && (
        <div className="modalProduct__desc" style={{ whiteSpace: "pre-line" }}>
          <b>Состав:</b>{"\n"}
          {item.composition}
        </div>
      )}

      {(item.tags || []).length > 0 && (
        <div className="modalProduct__tags">
          {item.tags.map((tag) => (
            <span key={tag} className="tag tag--lg">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="modalProduct__actions">
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
          <button className="btn btn--primary" onClick={() => onAdd(item)} disabled={isOutOfStock(item.availability)}>
            Добавить в корзину
          </button>
        )}

        <button className="btn btn--ghost" onClick={() => onQuickOrder(item)}>
          Быстрый заказ
        </button>
      </div>
    </div>
  );
}
