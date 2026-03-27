import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "cineverseDark",
    themes: {
      cineverseDark: {
        dark: true,
        colors: {
          background: "#020617",
          surface: "#0f172a",
          primary: "#f97316",
          secondary: "#14b8a6",
          info: "#38bdf8",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
    },
  },
});

export default vuetify;
