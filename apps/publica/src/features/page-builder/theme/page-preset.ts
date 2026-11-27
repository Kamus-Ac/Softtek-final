export const pageThemePreset = "restaurant-demo-v1";
export const pageImageResource = "/images/restaurant-placeholder.svg";

export const pageDeviceWidths = { tablet: "768px", mobile: "375px" } as const;

export const pageMediaQueries = {
  tablet: `(max-width: ${pageDeviceWidths.tablet})`,
  mobile: `(max-width: ${pageDeviceWidths.mobile})`,
} as const;
