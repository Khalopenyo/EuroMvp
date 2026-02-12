export function AppHeader({ store, openState, cartUnits, onGoHome, onOpenCart }) {
  return (
    <header className="header">
      <div className="header__brand" onClick={onGoHome}>
        <div className="logo" aria-hidden>
          {store.logoText}
        </div>
        <div className="brandText">
          <div className="brandText__name">{store.name}</div>
          <div className={`brandText__status ${openState.isOpenNow ? "isOpen" : "isClosed"}`}>
            {openState.text}
          </div>
        </div>
      </div>

      <button className="miniCart" onClick={onOpenCart} aria-label="Открыть корзину">
        <span aria-hidden>🛒</span>
        {cartUnits > 0 && <span className="miniCart__badge">{cartUnits}</span>}
      </button>
    </header>
  );
}
