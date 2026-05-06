import React, { useMemo, useEffect } from "react";
import ReactDOM from "react-dom";

import { debugData } from "./utils/debugData";
import { MantineProvider } from "@mantine/core";
import { customTheme } from "./theme";
import { isEnvBrowser } from "./utils/misc";
import { fetchNui } from "./utils/fetchNui";
import { HashRouter } from "react-router-dom";
import { ModalsProvider } from "@mantine/modals";
import { useConfig } from "./store/config";
import { useLocale } from "./store/locale";
import { resolveAccentColor } from "./utils/accentColor";

import enLocale from "../../locales/en.json";
import frLocale from "../../locales/fr.json";
import deLocale from "../../locales/de.json";
import esLocale from "../../locales/es.json";
import plLocale from "../../locales/pl.json";
import ptLocale from "../../locales/pt.json";

import App from "./App";
import "./index.css";

const DEV_LOCALES: Record<string, Record<string, unknown>> = {
  en: enLocale as Record<string, unknown>,
  fr: frLocale as Record<string, unknown>,
  de: deLocale as Record<string, unknown>,
  es: esLocale as Record<string, unknown>,
  pl: plLocale as Record<string, unknown>,
  pt: ptLocale as Record<string, unknown>,
};

const flattenLocale = (
  tbl: Record<string, unknown>,
  prefix = "",
  out: Record<string, string> = {}
): Record<string, string> => {
  for (const [k, v] of Object.entries(tbl)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      flattenLocale(v as Record<string, unknown>, key, out);
    } else if (typeof v === "string") {
      out[key] = v;
    }
  }
  return out;
};

debugData([
  {
    action: "setVisible",
    data: { visible: true },
  },
]);

if (isEnvBrowser()) {
  const root = document.getElementById("root");
  root!.style.backgroundImage = "url('https://i.imgur.com/3pzRj9n.png')";
  root!.style.backgroundSize = "cover";
  root!.style.backgroundRepeat = "no-repeat";
  root!.style.backgroundPosition = "center";
} else {
  fetchNui("ready", {});
}

const DevLocaleSwitcher: React.FC = () => {
  const setLocaleStrings = useLocale((s) => s.setStrings);
  const setLocaleName = useLocale((s) => s.setLocale);
  const locale = useLocale((s) => s.locale);

  useEffect(() => {
    const data = DEV_LOCALES[locale] ?? DEV_LOCALES.en;
    setLocaleStrings(flattenLocale(data));
  }, [locale, setLocaleStrings]);

  return (
    <select
      value={locale}
      onChange={(e) => setLocaleName(e.target.value)}
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        zIndex: 9999,
        padding: "4px 8px",
        background: "rgba(0,0,0,0.7)",
        color: "white",
        border: "1px solid #444",
        borderRadius: 4,
        fontFamily: "monospace",
        cursor: "pointer",
      }}
    >
      {Object.keys(DEV_LOCALES).map((k) => (
        <option key={k} value={k} style={{ background: "#222" }}>
          {k.toUpperCase()}
        </option>
      ))}
    </select>
  );
};

const Root: React.FC = () => {
  const accentColor = useConfig((s) => s.accentColor);

  const theme = useMemo(() => {
    const { primaryColor, colors } = resolveAccentColor(accentColor);
    return {
      ...customTheme,
      primaryColor,
      ...(colors ? { colors: { ...customTheme.colors, ...colors } } : {}),
    };
  }, [accentColor]);

  return (
    <MantineProvider withNormalizeCSS theme={theme}>
      <ModalsProvider modalProps={{ transition: "slide-up", withinPortal: false }}>
        <HashRouter>
          <App />
          {isEnvBrowser() && <DevLocaleSwitcher />}
        </HashRouter>
      </ModalsProvider>
    </MantineProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById("root")
);
