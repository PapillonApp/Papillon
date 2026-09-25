import React from "react";

// Shim web/desktop pour `@react-native-community/datetimepicker`.
//
// Ce paquet n'a aucune implémentation web (uniquement iOS/Android/Windows).
// Plutôt que de désactiver la sélection de date/heure sur PC, on s'appuie
// sur les <input type="date"|"time"|"datetime-local"> natifs du navigateur
// (Tauri embarque WebView2 sur Windows, qui les supporte très bien,
// showPicker() inclus). Seule la surface réellement utilisée par l'app
// (app/(new)/event.tsx) est couverte : le composant inline `DateTimePicker`
// et l'API impérative `DateTimePickerAndroid.open(...)`.

type Mode = "date" | "time" | "datetime";

type ChangeEvent = { type: "set" | "dismissed" };
type OnChange = (event: ChangeEvent, date?: Date) => void;

function inputTypeFor(mode?: Mode): string {
  if (mode === "time") return "time";
  if (mode === "datetime") return "datetime-local";
  return "date";
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Formate une Date en valeur compatible avec l'<input> HTML correspondant.
function formatValue(date: Date, mode?: Mode): string {
  const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (mode === "time") return timePart;
  if (mode === "datetime") return `${datePart}T${timePart}`;
  return datePart;
}

// Reconstruit une Date à partir de la valeur brute de l'<input>, en
// conservant les composantes non concernées par le "mode" (ex: en mode
// "time", on garde l'année/mois/jour de la valeur de départ).
function parseValue(raw: string, mode: Mode | undefined, base: Date): Date | undefined {
  if (!raw) return undefined;
  const next = new Date(base);
  if (mode === "time") {
    const [h, m] = raw.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return undefined;
    next.setHours(h, m, 0, 0);
    return next;
  }
  if (mode === "datetime") {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  const [y, mo, d] = raw.split("-").map(Number);
  if (Number.isNaN(y) || Number.isNaN(mo) || Number.isNaN(d)) return undefined;
  next.setFullYear(y, mo - 1, d);
  return next;
}

type DateTimePickerProps = {
  value: Date;
  mode?: Mode;
  onChange?: OnChange;
  style?: React.CSSProperties;
};

// Composant inline (branche Platform.OS === "ios" dans le code appelant ;
// non atteinte sur web aujourd'hui, mais fournie pour rester fidèle à l'API
// réelle si un futur écran l'utilise directement).
const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, mode, onChange, style }) => {
  return (
    <input
      type={inputTypeFor(mode)}
      value={formatValue(value, mode)}
      onChange={(e) => {
        const next = parseValue(e.target.value, mode, value);
        onChange?.({ type: next ? "set" : "dismissed" }, next);
      }}
      style={{
        fontFamily: "inherit",
        fontSize: 14,
        padding: "4px 6px",
        borderRadius: 6,
        border: "1px solid rgba(0,0,0,0.15)",
        ...style,
      }}
    />
  );
};

type OpenOptions = {
  value: Date;
  mode?: Mode;
  onChange?: OnChange;
};

// API impérative utilisée par la branche "Android" du code appelant :
// on crée un <input> HTML invisible, on ouvre son picker natif via
// showPicker() et on relaie le résultat au callback fourni, puis on
// nettoie l'élément temporaire.
export const DateTimePickerAndroid = {
  open(options: OpenOptions): void {
    const { value, mode, onChange } = options;

    const input = document.createElement("input");
    input.type = inputTypeFor(mode);
    input.value = formatValue(value, mode);
    input.style.position = "fixed";
    input.style.opacity = "0";
    input.style.pointerEvents = "none";
    input.style.top = "-1000px";
    document.body.appendChild(input);

    let settled = false;
    const cleanup = () => {
      if (input.parentNode) input.parentNode.removeChild(input);
    };

    input.addEventListener("change", () => {
      settled = true;
      const next = parseValue(input.value, mode, value);
      onChange?.({ type: next ? "set" : "dismissed" }, next);
      cleanup();
    });

    // Si l'utilisateur ferme le picker sans choisir de valeur, le
    // navigateur ne déclenche pas toujours "change" : on nettoie sur blur
    // par sécurité, sans appeler onChange dans ce cas (rien n'a changé).
    input.addEventListener("blur", () => {
      window.setTimeout(() => {
        if (!settled) cleanup();
      }, 300);
    });

    if (typeof (input as any).showPicker === "function") {
      (input as any).showPicker();
    } else {
      input.focus();
      input.click();
    }
  },
};

export default DateTimePicker;
