import { availabilityLabel, availabilityTone } from "../../state/storefront/logic";
import { formatRUB } from "../../utils/format";
import { EmptyState } from "../common/EmptyState";
import { Segmented } from "../common/Segmented";

export function CartView({ state, cart, actions, store }) {
  return (
    <section className="section">
      <div className="section__head">
        <div>
          <div className="section__title">Корзина</div>
          <div className="section__sub">
            {cart.cartUnits} шт. • {formatRUB(cart.total)}
          </div>
        </div>
        <button className="link" onClick={() => actions.setView("home")}>
          К товарам
        </button>
      </div>

      {cart.cartItems.length === 0 ? (
        <EmptyState
          title="Корзина пустая"
          subtitle="Добавьте товары с главной страницы."
          action={
            <button className="btn btn--primary" onClick={() => actions.setView("home")}>
              Открыть товары
            </button>
          }
        />
      ) : (
        <>
          <div className="cartList">
            {cart.cartItems.map((item) => (
              <div className="cartItem" key={item.id}>
                <img className="cartItem__img" src={item.image} alt={item.name} loading="lazy" />

                <div className="cartItem__mid">
                  <div className="cartItem__name">{item.name}</div>
                  <div className="cartItem__sub">
                    <span className="cartItem__price">{formatRUB(item.price)}</span>
                    <span className={`dot dot--${availabilityTone(item.availability)}`} />
                    <span className="cartItem__stock">{availabilityLabel(item.availability)}</span>
                  </div>
                </div>

                <div className="cartItem__right">
                  <button className="cartItem__remove" onClick={() => actions.removeFromCart(item.id)}>
                    Удалить
                  </button>
                  <div className="qty qty--sm">
                    <button className="qty__btn" onClick={() => actions.dec(item.id)}>
                      –
                    </button>
                    <div className="qty__val">{item.qty}</div>
                    <button className="qty__btn" onClick={() => actions.inc(item.id)}>
                      +
                    </button>
                  </div>
                  <div className="cartItem__sum">{formatRUB(item.price * item.qty)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout">
            <div className="checkout__top">
              <div className="checkout__totalLabel">Итоговая сумма</div>
              <div className="checkout__total">{formatRUB(cart.total)}</div>
            </div>

            <div className="checkout__block">
              <div className="label">Способ получения</div>
              <Segmented
                value={state.pickupMode}
                onChange={actions.setPickupMode}
                options={[
                  { value: "pickup", label: "Самовывоз" },
                  { value: "delivery", label: "Доставка" },
                ]}
              />
            </div>

            {state.pickupMode === "delivery" && cart.total < store.minDeliveryOrder && (
              <div className="checkout__warning">
                Для доставки минимальная сумма {formatRUB(store.minDeliveryOrder)}.
              </div>
            )}

            <div className="checkout__block">
              <div className="label">Контактные данные</div>
              <div className="form">
                <input
                  value={state.customer.name}
                  onChange={(event) => actions.setCustomerField("name", event.target.value)}
                  placeholder="Имя"
                  aria-label="Имя"
                />
                <input
                  value={state.customer.phone}
                  onChange={(event) => actions.setCustomerField("phone", event.target.value)}
                  placeholder="Телефон"
                  aria-label="Телефон"
                  inputMode="tel"
                />

                {state.pickupMode === "delivery" && (
                  <>
                    <input
                      value={state.customer.address}
                      onChange={(event) => actions.setCustomerField("address", event.target.value)}
                      placeholder="Адрес доставки"
                      aria-label="Адрес доставки"
                    />
                    <input
                      value={state.customer.landmark}
                      onChange={(event) => actions.setCustomerField("landmark", event.target.value)}
                      placeholder="Ориентир (опционально)"
                      aria-label="Ориентир"
                    />
                  </>
                )}

                <textarea
                  value={state.customer.comment}
                  onChange={(event) => actions.setCustomerField("comment", event.target.value)}
                  placeholder="Комментарий к заказу"
                  aria-label="Комментарий"
                  rows={3}
                />
              </div>
            </div>

            <div className="checkout__actions">
              <button className="btn btn--ghost" onClick={actions.clearCart}>
                Очистить корзину
              </button>
              <button className="btn btn--primary" onClick={() => actions.submitOrder("wa")}>
                Отправить в WhatsApp
              </button>
              <button className="btn btn--primary" onClick={() => actions.submitOrder("tg")}>
                Отправить в Telegram
              </button>
            </div>

            <div className="checkout__hint">
              После отправки откроется чат с готовым текстом заказа. Мы подтвердим наличие и время доставки.
            </div>
          </div>
        </>
      )}
    </section>
  );
}
