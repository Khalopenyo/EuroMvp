import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { createStorefrontDependencies } from "./state/storefront/dependencies";
import "./index.scss";

const storefrontDependencies = createStorefrontDependencies();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App dependencies={storefrontDependencies} />
  </StrictMode>
);
