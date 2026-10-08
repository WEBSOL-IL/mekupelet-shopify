declare module "*.css";

// React 19 reads JSX types from `React.JSX`; @shopify/app-bridge-types still augments the
// legacy global `JSX` namespace, so the App Bridge elements are declared here as well.
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type AppBridgeElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "s-app-nav": AppBridgeElement;
      "ui-nav-menu": AppBridgeElement;
      "ui-title-bar": AppBridgeElement & { title?: string };
      "ui-save-bar": AppBridgeElement & { id?: string };
    }
  }
}
