import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "tr"],

  // Used when no locale matches
  defaultLocale: "tr",
});
