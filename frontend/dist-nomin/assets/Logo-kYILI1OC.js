import { j as jsxRuntimeExports } from "./index-DLrGS1ff.js";
const BrandImage = ({ className = "", large }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "img",
  {
    className,
    src: large ? "/assets/logo.webp" : "/assets/logo-sm.webp",
    width: large ? 640 : 256,
    height: large ? 569 : 228,
    alt: "Logotipo de GEO GYM",
    decoding: "async"
  }
);
const Logo = ({ light, subtitle = "Materiales", size = 46 }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `logo ${light ? "logo--light" : ""}`, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "logo__mark", src: "/assets/logo-sm.webp", alt: "", width: size, height: size }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "logo__word", children: [
    "GEO GYM",
    subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("small", { children: subtitle })
  ] })
] });
export {
  BrandImage as B,
  Logo as L
};
