import type { PageStyles } from "../types/page-document";
import { allowKeys, readRecord, requirePageValue } from "./page-values";

const length = /^-?(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|%|vh|vw)?$/i;
const number = /^(?:\d+(?:\.\d+)?|\.\d+)$/;
const literalColor = /^(?:#[a-f\d]{3,4}|#[a-f\d]{6}|#[a-f\d]{8}|transparent|currentcolor|black|white|red|green|blue|gray|grey)$/i;
const colorChannel = /^(?:\d+(?:\.\d+)?|\.\d+)%?$/;
const fontFamily = /^(?:[\p{L}\d][\p{L}\d -]*|"[\p{L}\d][\p{L}\d -]*"|'[\p{L}\d][\p{L}\d -]*')$/u;
const borderStyles = ["none", "hidden", "solid", "dotted", "dashed", "double", "groove", "ridge", "inset", "outset"];
const align = ["normal", "start", "end", "center", "stretch", "flex-start", "flex-end", "baseline", "space-between", "space-around", "space-evenly"];
const choices: Record<string, readonly string[]> = {
  display: ["block", "inline", "inline-block", "flex", "grid"],
  "text-align": ["left", "right", "center", "justify", "start", "end"],
  "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
  "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
  "justify-content": align,
  "align-items": align,
  "font-weight": ["normal", "bold", "bolder", "lighter", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
};

function isLength(value: string, negative = false) {
  const amount = parseFloat(value);
  return length.test(value) && Math.abs(amount) <= 10_000 && (negative || amount >= 0)
    && (amount === 0 || /[a-z%]$/i.test(value));
}

function isColor(value: string) {
  if (literalColor.test(value)) return true;
  const functionColor = /^(rgb|hsl)a?\(([^()]*)\)$/i.exec(value);
  if (!functionColor) return false;
  const [, format, body] = functionColor;
  const commaSyntax = body.includes(",");
  const parts = commaSyntax ? body.split(",") : body.split("/");
  const channels = (commaSyntax ? parts.slice(0, 3) : parts[0].trim().split(/\s+/)).map((token) => token.trim());
  const alpha = (commaSyntax ? parts[3] : parts[1])?.trim();
  const within = (token: string, limit: number) => colorChannel.test(token)
    && parseFloat(token) <= (token.endsWith("%") ? 100 : limit);
  if (channels.length !== 3 || parts.length > (commaSyntax ? 4 : 2)
    || (alpha !== undefined && !within(alpha, 1))) return false;
  if (format.toLowerCase() === "rgb") return channels.every((token) => within(token, 255));
  return /^-?(?:\d+(?:\.\d+)?|\.\d+)(?:deg)?$/.test(channels[0])
    && channels.slice(1).every((token) => token.endsWith("%") && within(token, 100));
}

function isAllowedStyle(property: string, value: string): boolean {
  if (Object.hasOwn(choices, property)) return choices[property].includes(value);
  if (/^(?:color|background-color|border(?:-(?:top|right|bottom|left))?-color)$/.test(property)) return isColor(value);
  if (property === "font-family") return value.split(",").every((family) => fontFamily.test(family.trim()));
  if (property === "opacity") return number.test(value) && Number(value) <= 1;
  if (property === "line-height") return value === "normal" || (number.test(value) && Number(value) <= 20) || isLength(value);
  if (/^(?:min-|max-)?(?:width|height)$/.test(property)) {
    return isLength(value) || ["auto", "none", "min-content", "max-content", "fit-content"].includes(value);
  }
  if (property === "font-size") return isLength(value);
  if (/^(?:margin|padding)(?:-(?:top|right|bottom|left))?$|^(?:row-|column-)?gap$|^border(?:-(?:top|bottom)-(?:left|right))?-radius$/.test(property)) {
    const tokens = value.split(/\s+/);
    const max = /^(?:margin|padding|border-radius)$/.test(property) ? 4 : property === "gap" ? 2 : 1;
    return tokens.length <= max && tokens.every((token) =>
      (property.startsWith("margin") && token === "auto") || isLength(token, property.startsWith("margin")));
  }
  if (/^border(?:-(?:top|right|bottom|left))?-style$/.test(property)) return borderStyles.includes(value);
  if (/^border(?:-(?:top|right|bottom|left))?-width$/.test(property)) return isLength(value) || ["thin", "medium", "thick"].includes(value);
  if (/^border(?:-(?:top|right|bottom|left))?$/.test(property)) {
    const tokens = value.split(/\s+(?![^()]*\))/);
    return tokens.length <= 3 && tokens.every((token) =>
      isAllowedStyle("border-width", token) || borderStyles.includes(token) || isColor(token));
  }
  if (property === "box-shadow") {
    return value === "none" || value.split(/,(?![^()]*\))/).every((shadow) => {
      const tokens = shadow.trim().split(/\s+(?![^()]*\))/);
      const lengths = tokens.filter((token) => isLength(token, true));
      return lengths.length >= 2 && lengths.length <= 4 && tokens.length <= 6
        && tokens.every((token) => token === "inset" || isColor(token) || isLength(token, true));
    });
  }
  return false;
}

export function readDeclarations(input: unknown, path: string): Record<string, string> {
  const declarations = readRecord(input, path);
  requirePageValue(Object.keys(declarations).length <= 48, path, "Demasiadas propiedades CSS.");
  const validated: Record<string, string> = {};
  for (const [property, value] of Object.entries(declarations)) {
    requirePageValue(typeof value === "string" && value.length <= 256
      && !/[;{}<>\\!@]/.test(value) && isAllowedStyle(property, value.trim()),
    `${path}.${property}`, "Propiedad o valor CSS fuera del catálogo.");
    validated[property] = value.trim();
  }
  return validated;
}

export function readPageStyles(value: unknown, path: string): PageStyles {
  const input = readRecord(value, path);
  const breakpoints = ["base", "tablet", "mobile"] as const;
  allowKeys(input, breakpoints, path);
  const styles: PageStyles = {};
  for (const breakpoint of breakpoints) {
    if (breakpoint in input) styles[breakpoint] = readDeclarations(input[breakpoint], `${path}.${breakpoint}`);
  }
  return styles;
}
