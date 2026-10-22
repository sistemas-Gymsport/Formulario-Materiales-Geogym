import { c as createLucideIcon, g as useToast, j as jsxRuntimeExports, b as ErrorState, d as Skeleton, S as StatusPill, f as adminApi } from "./index-DLrGS1ff.js";
import { r as reactExports } from "./react-0QgR9_yw.js";
import { u as useResource } from "./useResource-vQCejOh0.js";
import { u as useAction } from "./useAction-BTeAeJfr.js";
import { P as PageHeader, S as StatCard, C as Card } from "./AdminUi-DJ-0AwxO.js";
import { B as Button } from "./Button-gyxO_wIM.js";
import { M as Modal } from "./Modal-D3Tpr7Pg.js";
import { S as Switch, T as TextField } from "./Field-B-OAoH6p.js";
import { c as formatDateTime } from "./dates-DPZEv6RN.js";
import { S as Save } from "./save-E1YfC_zl.js";
import { K as KeyRound } from "./key-round-DXjRlkqX.js";
import "./motion-C6keS6sr.js";
import "./x-B59TumVd.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode$5);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }],
  ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }],
  ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]
];
const Link2 = createLucideIcon("link-2", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z", key: "vv11sd" }]
];
const MessageCircle = createLucideIcon("message-circle", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    {
      d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
      key: "9njp5v"
    }
  ]
];
const Phone = createLucideIcon("phone", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    { d: "M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z", key: "goz73y" }
  ],
  ["path", { d: "m2 22 3-3", key: "19mgm9" }],
  ["path", { d: "M7.5 13.5 10 11", key: "7xgeeb" }],
  ["path", { d: "M10.5 16.5 13 14", key: "10btkg" }],
  ["path", { d: "m18 3-4 4h6l-4 4", key: "16psg9" }]
];
const PlugZap = createLucideIcon("plug-zap", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode);
const STATUS = {
  disabled: { tone: "neutral", label: "Desactivada" },
  unverified: { tone: "warning", label: "Sin verificar" },
  connected: { tone: "open", label: "Conectada" },
  error: { tone: "closed", label: "Con errores" }
};
const PHONE = /^\+[1-9]\d{7,14}$/;
const toForm = (s) => ({ enabled: s.enabled, webhookUrl: s.webhookUrl ?? "", destinationPhone: s.destinationPhone ?? "", authMode: s.authMode, heldPolicy: s.heldPolicy, credential: "" });
const validate = (form, settings) => {
  const errors = {};
  const phone = form.destinationPhone.replace(/[\s()-]/g, "");
  if (phone && !PHONE.test(phone)) errors.destinationPhone = "Usa formato internacional: +5215512345678";
  if (form.webhookUrl && !/^https?:\/\/.+/i.test(form.webhookUrl)) errors.webhookUrl = "URL inválida";
  if (form.credential && form.credential.length < 16) errors.credential = "Mínimo 16 caracteres";
  if (form.enabled) {
    if (!form.webhookUrl) errors.webhookUrl = "Requerida para activar";
    if (!phone) errors.destinationPhone = "Requerido para activar";
    if (!form.credential && !settings.hasCredential) errors.credential = "Define un secreto o genéralo";
  }
  return errors;
};
const ResultLine = ({ at, ok, message, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: label }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: at ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { tone: ok ? "open" : "closed", children: ok ? "Correcto" : "Error" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("small", { className: "muted", style: { display: "block", marginTop: 6 }, children: [
      formatDateTime(at),
      " · ",
      message
    ] })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "muted", children: "Sin registros" }) })
] });
function IntegrationsPage() {
  const settings = useResource(() => adminApi.integrations.get(), []);
  const [form, setForm] = reactExports.useState(null);
  const [errors, setErrors] = reactExports.useState({});
  const [secret, setSecret] = reactExports.useState(null);
  const { run, busy } = useAction();
  const toast = useToast();
  reactExports.useEffect(() => {
    if (settings.data) setForm(toForm(settings.data));
  }, [settings.data]);
  if (settings.error) return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error: settings.error, onRetry: settings.reload });
  if (!form) return /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 420, radius: 20 });
  const s = settings.data;
  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: null }));
  };
  const save = async () => {
    const found = validate(form, s);
    if (Object.keys(found).length) return setErrors(found);
    const body = { ...form, credential: form.credential || void 0 };
    const result = await run("save", () => adminApi.integrations.save(body), "Integración guardada");
    if (result) settings.setData(result);
    return void 0;
  };
  const rotate = async () => {
    const result = await run("rotate", () => adminApi.integrations.rotate());
    if (result) {
      setSecret(result.secret);
      settings.setData(result.settings);
    }
  };
  const test = async () => {
    const result = await run("test", () => adminApi.integrations.test());
    if (!result) return;
    settings.setData(result.settings);
    if (result.result.ok) toast.success("El webhook respondió correctamente");
    else toast.error(result.result.message);
  };
  const retry = async () => {
    const result = await run("retry", () => adminApi.integrations.retry());
    if (result) {
      settings.setData(result.settings);
      toast.success(`${result.requeued} eventos reprogramados`);
    }
  };
  const status = STATUS[s.connectionStatus];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        kicker: "Integraciones",
        title: "Notificaciones por WhatsApp",
        description: "El backend envía cada solicitud confirmada a tu flujo de n8n, que la reenvía por WhatsApp. Registrar solicitudes nunca depende de esta integración.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "coral", icon: Save, loading: busy === "save", onClick: save, children: "Guardar" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid", style: { gap: 20 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid--stats", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Estado", value: status.label, icon: PlugZap, tone: s.connectionStatus === "connected" ? "accent" : void 0, index: 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Pendientes", value: (s.outbox.PENDING ?? 0) + (s.outbox.PROCESSING ?? 0), icon: RefreshCw, index: 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Enviadas a n8n", value: s.outbox.SENT ?? 0, icon: MessageCircle, index: 2 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Fallidas", value: s.outbox.FAILED ?? 0, icon: RefreshCw, index: 3, hint: s.outbox.HELD ? `${s.outbox.HELD} retenidas` : void 0 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid--2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Configuración", subtitle: "Guardada en PostgreSQL; el secreto se cifra y nunca se envía al navegador", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid", style: { gap: 18 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.enabled, onChange: (v) => set("enabled", v), label: "Activar integración", description: "Desactivada, el sistema no realiza peticiones externas." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "URL del webhook de n8n", icon: Link2, value: form.webhookUrl, onChange: (e) => set("webhookUrl", e.target.value), placeholder: "https://n8n.tudominio.com/webhook/geogym", error: errors.webhookUrl, maxLength: 500 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Número de WhatsApp destinatario", icon: Phone, value: form.destinationPhone, onChange: (e) => set("destinationPhone", e.target.value), placeholder: "+5215512345678", error: errors.destinationPhone, hint: "Formato internacional con código de país." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: "Secreto compartido",
              icon: KeyRound,
              type: "password",
              value: form.credential,
              autoComplete: "new-password",
              onChange: (e) => set("credential", e.target.value),
              placeholder: s.hasCredential ? `Guardado (${s.credentialHint}). Escribe para reemplazar` : "Mínimo 16 caracteres",
              error: errors.credential
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", icon: KeyRound, loading: busy === "rotate", onClick: rotate, style: { justifySelf: "start" }, children: "Generar secreto seguro" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TextField, { as: "select", label: "Autenticación del webhook", value: form.authMode, onChange: (e) => set("authMode", e.target.value), hint: "HMAC firma cada envío sin transmitir el secreto. Bearer facilita usar Header Auth en n8n.", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "hmac", children: "Firma HMAC-SHA256 (recomendado)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "header", children: "Firma HMAC + encabezado Authorization Bearer" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TextField, { as: "select", label: "Solicitudes registradas mientras estuvo desactivada", value: form.heldPolicy, onChange: (e) => set("heldPolicy", e.target.value), hint: "Se aplica al activar la integración.", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ignore", children: "Ignorarlas (evita envíos históricos)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "send", children: "Enviarlas al activar" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { title: "Conexión", subtitle: "Una respuesta 2xx de n8n confirma la recepción del webhook, no la entrega en WhatsApp", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "kv", style: { gridTemplateColumns: "1fr", gap: 18 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Estado" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { tone: status.tone, children: status.label }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResultLine, { label: "Última prueba", at: s.lastTestAt, ok: s.lastTestOk, message: s.lastTestMessage }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResultLine, { label: "Último envío", at: s.lastDeliveryAt, ok: s.lastDeliveryOk, message: s.lastDeliveryMessage }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Confirmación de entrega (opcional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { style: { fontWeight: 600 }, children: [
                "n8n puede reportar la entrega real enviando un POST firmado a ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: s.callbackPath }),
                "."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "dark", size: "sm", icon: PlugZap, loading: busy === "test", onClick: test, children: "Probar conexión" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", icon: RefreshCw, loading: busy === "retry", onClick: retry, disabled: !s.outbox.FAILED, children: "Reintentar fallidas" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: Boolean(secret),
        onClose: () => setSecret(null),
        title: "Nuevo secreto generado",
        description: "Cópialo ahora y configúralo en n8n. Por seguridad no volverá a mostrarse.",
        footer: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "coral",
            icon: Copy,
            onClick: async () => {
              await navigator.clipboard?.writeText(secret);
              toast.success("Secreto copiado");
            },
            children: "Copiar secreto"
          }
        ),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "secret-box", children: secret })
      }
    )
  ] });
}
export {
  IntegrationsPage as default
};
