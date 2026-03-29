/**
 * Système de montage React pour Rails.
 * Tout élément DOM avec data-react-component="ComponentName"
 * sera monté automatiquement au chargement de la page.
 *
 * Usage dans une vue Rails :
 *   <div data-react-component="RemotionPlayer"
 *        data-props='{"component":"HelloWorld","controls":true}'></div>
 */

import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { RemotionPlayer } from "./components/RemotionPlayer";
import { WorkCarousel } from "./components/WorkCarousel";

const COMPONENTS = {
  RemotionPlayer,
  WorkCarousel,
};

const roots = new Map();

function mountComponents() {
  document.querySelectorAll("[data-react-component]").forEach((el) => {
    const name = el.dataset.reactComponent;
    const Comp = COMPONENTS[name];
    if (!Comp) return;

    const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};

    if (roots.has(el)) {
      roots.get(el).render(createElement(Comp, props));
    } else {
      const root = createRoot(el);
      root.render(createElement(Comp, props));
      roots.set(el, root);
    }
  });
}

// Turbo Drive : remonte les composants à chaque navigation
document.addEventListener("turbo:load", mountComponents);
// Premier chargement sans Turbo
document.addEventListener("DOMContentLoaded", mountComponents);
