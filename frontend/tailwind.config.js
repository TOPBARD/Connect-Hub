import daisyUIThemes from "daisyui/src/theming/themes";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        container: "hsl(var(--container))",
        "gray-primary": "hsl(var(--gray-primary))",
        "gray-secondary": "hsl(var(--gray-secondary))",
        "gray-tertiary": "hsl(var(--gray-tertiary))",
        "left-panel": "hsl(var(--left-panel))",
        "chat-hover": "hsl(var(--chat-hover))",
        "green-primary": "hsl(var(--green-primary))",
        "green-secondary": "hsl(var(--green-secondary))",
        "green-chat": "hsl(var(--green-chat))",
      },
      backgroundImage: {
        "chat-tile-light": "url('/bg-light.png')",
        "chat-tile-dark": "url('/bg-dark.png')",
      },
    },
  },
  plugins: [require("daisyui")],

  daisyui: {
    themes: [
      "light",
      {
        black: {
          ...daisyUIThemes["black"],
          primary: "rgb(29, 155, 240)",
          secondary: "rgb(24, 24, 24)",
        },
      },
    ],
  },
};
