import { useStorefront } from "./state/storefront/useStorefront";
import { AppHeader } from "./components/layout/AppHeader";
import { BottomNav } from "./components/layout/BottomNav";
import { CatalogView } from "./components/catalog/CatalogView";
import { CartView } from "./components/cart/CartView";
import { Modal } from "./components/common/Modal";
import { ProductModalContent } from "./components/modals/ProductModalContent";

export default function App({ dependencies }) {
  const { state, catalog, cart, actions, meta } = useStorefront(dependencies);
  const { store } = meta;

  return (
    <div className="app">
      <AppHeader
        store={store}
        openState={catalog.openState}
        cartUnits={cart.cartUnits}
        onGoHome={() => actions.setView("home")}
        onOpenCart={() => actions.setView("cart")}
      />

      <main className="main">
        {state.view === "home" && (
          <CatalogView state={state} catalog={catalog} cart={cart} actions={actions} />
        )}

        {state.view === "cart" && (
          <CartView state={state} cart={cart} actions={actions} store={store} />
        )}
      </main>

      <BottomNav view={state.view} cartUnits={cart.cartUnits} onChangeView={actions.setView} />

      <Modal
        open={!!state.productModal}
        onClose={() => actions.setProductModal(null)}
        title={state.productModal?.name || ""}
      >
        {state.productModal && (
          <ProductModalContent
            item={state.productModal}
            qty={cart.qtyOf(state.productModal.id)}
            onInc={actions.inc}
            onDec={actions.dec}
            onAdd={actions.addToCart}
            onQuickOrder={actions.quickOrder}
          />
        )}
      </Modal>
    </div>
  );
}
