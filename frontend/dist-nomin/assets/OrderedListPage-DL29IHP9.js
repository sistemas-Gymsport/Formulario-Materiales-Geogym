import { g as useToast, j as jsxRuntimeExports, b as ErrorState, d as Skeleton, E as EmptyState } from "./index-DLrGS1ff.js";
import { r as reactExports } from "./react-0QgR9_yw.js";
import { u as useResource } from "./useResource-vQCejOh0.js";
import { u as useAction } from "./useAction-BTeAeJfr.js";
import { P as PageHeader, C as Card } from "./AdminUi-DJ-0AwxO.js";
import { A as ActiveBadge, R as RowActions, E as EntityModal } from "./RowActions-B8nVbKyH.js";
import { B as Button } from "./Button-gyxO_wIM.js";
import { P as Plus } from "./plus-DYeHZmIa.js";
const OrderedListPage = ({ kicker, title, description, noun, feminine, api, load, columns, fields, emptyValues, toInitial, toBody, extra }) => {
  const list = useResource(load, []);
  const [editing, setEditing] = reactExports.useState(null);
  const { run, busy } = useAction();
  const toast = useToast();
  const g = feminine ? "a" : "o";
  const act = async (id, task, message) => {
    if (await run(id, task, message)) list.reload({ silent: true });
  };
  const save = async (values) => {
    const id = editing.id;
    await (id ? api.update(id, toBody(values)) : api.create(toBody(values)));
    toast.success(id ? `${noun} actualizad${g}` : `${noun} registrad${g}`);
    list.reload({ silent: true });
  };
  const items = list.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        kicker,
        title,
        description,
        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "coral", icon: Plus, onClick: () => setEditing({ values: emptyValues }), children: [
          "Nuev",
          g
        ] })
      }
    ),
    extra,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: list.error ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error: list.error, onRetry: list.reload }) : !list.data ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 260, radius: 16 }) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(EmptyState, { title: "Sin registros", children: [
      "Crea el primer registro con el botón «Nuev",
      g,
      "»."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "table table--stack", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        columns.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: c.num ? "num" : void 0, children: c.label }, c.label)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Estado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: items.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: item.isActive ? "" : "is-inactive", children: [
        columns.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": c.label, className: [c.num && "num", c.primary && "table__primary"].filter(Boolean).join(" ") || void 0, children: c.render(item) }, c.label)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Estado", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ActiveBadge, { active: item.isActive }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          RowActions,
          {
            label: item.name,
            isActive: item.isActive,
            busy: busy === item.id,
            first: index === 0,
            last: index === items.length - 1,
            onMove: (dir) => act(item.id, () => api.move(item.id, dir)),
            onEdit: () => setEditing({ id: item.id, values: toInitial(item) }),
            onToggle: () => act(item.id, () => api.update(item.id, { isActive: !item.isActive }), item.isActive ? `${noun} desactivad${g}` : `${noun} reactivad${g}`)
          }
        ) })
      ] }, item.id)) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EntityModal,
      {
        open: Boolean(editing),
        title: editing?.id ? `Editar ${noun.toLowerCase()}` : `Nuev${g} ${noun.toLowerCase()}`,
        fields,
        initialValues: editing?.values ?? emptyValues,
        onSubmit: save,
        onClose: () => setEditing(null)
      }
    )
  ] });
};
export {
  OrderedListPage as O
};
