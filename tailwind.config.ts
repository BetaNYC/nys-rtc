import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        rtc_navy: "#121D3E",
        rtc_purple: "#812948",
        background_blue: "#F1F4FA",
        blue_selected: "#D7E3FA",
        grey_1: "#7B7B7B",
        grey_2: "#525252",
        demo: "#007CEE",
        demo_1:"#0057A8",
        rep: "#D04E40",
        rep_1:"#A03327"
      },
      fontSize: {
        headline: "30px",
        subheadline: "18px",
        title: "16px",
        body: "14px",
        label: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
