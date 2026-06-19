import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px"
      },
      colors: {
        ink: "#172033",
        brand: "#f36f21",
        line: "#dbe3ee"
      }
    }
  },
  plugins: []
};

export default config;
