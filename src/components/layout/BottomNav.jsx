export function BottomNav({ view, cartUnits, onChangeView }) {
  return (
    <nav className="bottomNav" aria-label="Навигация">
      <button
        className={`bottomNav__item ${view === "home" ? "isActive" : ""}`}
        onClick={() => onChangeView("home")}
      >
        <span aria-hidden>🏠</span>
        <span>Главная</span>
      </button>

      <button
        className={`bottomNav__item ${view === "cart" ? "isActive" : ""}`}
        onClick={() => onChangeView("cart")}
      >
        <span aria-hidden>🛒</span>
        <span>Корзина</span>
        {cartUnits > 0 && <span className="bottomNav__badge">{cartUnits}</span>}
      </button>
    </nav>
  );
}
