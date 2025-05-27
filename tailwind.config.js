  import { heroui } from "@heroui/react";

  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    darkMode: "class",
    plugins: [
      heroui({
        layout: {
          dividerWeight: "1px", 
          disabledOpacity: 0.45, 
          fontSize: {
            tiny: "0.75rem",   // 12px
            small: "0.875rem", // 14px
            medium: "0.9375rem", // 15px
            large: "1.125rem", // 18px
          },
          lineHeight: {
            tiny: "1rem", 
            small: "1.25rem", 
            medium: "1.5rem", 
            large: "1.75rem", 
          },
          radius: {
            small: "6px", 
            medium: "8px", 
            large: "12px", 
          },
          borderWidth: {
            small: "1px", 
            medium: "1px", 
            large: "2px", 
          },
        },
        themes: {
          light: {
            colors: {
 primary: {
  50: "#e8ecf7",
  100: "#cfd8ef",
  200: "#a3b3de",
  300: "#7a91cf",
  400: "#5670c0",
  500: "#3A5DAE",
  600: "#2f4b91",
  700: "#243b75",
  800: "#1a2b59",
  900: "#0f1c3d",
  DEFAULT: "#3A5DAE",
  foreground: "#ffffff"
}
            }
          }
        }
      })
    ]
  }
