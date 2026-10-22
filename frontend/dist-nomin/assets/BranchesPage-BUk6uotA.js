import { j as jsxRuntimeExports, f as adminApi } from "./index-DLrGS1ff.js";
import { O as OrderedListPage } from "./OrderedListPage-DL29IHP9.js";
import "./react-0QgR9_yw.js";
import "./motion-C6keS6sr.js";
import "./useResource-vQCejOh0.js";
import "./useAction-BTeAeJfr.js";
import "./AdminUi-DJ-0AwxO.js";
import "./RowActions-B8nVbKyH.js";
import "./Modal-D3Tpr7Pg.js";
import "./x-B59TumVd.js";
import "./Button-gyxO_wIM.js";
import "./Field-B-OAoH6p.js";
import "./save-E1YfC_zl.js";
import "./eye-BpTxpMJ7.js";
import "./plus-DYeHZmIa.js";
const EMPTY = { name: "", isActive: true };
const FIELDS = [
  { name: "name", label: "Nombre de la sucursal", maxLength: 80, placeholder: "Ej. Satélite", validate: (v) => !v || v.trim().length < 2 ? "Escribe al menos 2 caracteres" : null },
  { name: "isActive", label: "Disponible en el formulario", type: "switch" }
];
const COLUMNS = [
  { label: "Sucursal", primary: true, render: (b) => b.name },
  { label: "Solicitudes históricas", num: true, render: (b) => b._count.requests }
];
function BranchesPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    OrderedListPage,
    {
      kicker: "Catálogo",
      title: "Sucursales",
      description: "Las sucursales activas aparecen en el formulario público. Las solicitudes históricas conservan el nombre original.",
      feminine: true,
      noun: "Sucursal",
      api: adminApi.branches,
      load: () => adminApi.branches.list(),
      columns: COLUMNS,
      fields: FIELDS,
      emptyValues: EMPTY,
      toInitial: (b) => ({ name: b.name, isActive: b.isActive }),
      toBody: (v) => ({ name: v.name.trim(), isActive: v.isActive })
    }
  );
}
export {
  BranchesPage as default
};
