/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#176348",
        "brand-light": "#EAF5EF",
        app: "#F4F6F5",
        card: "#FFFFFF",
        border: "#DFE6E2",
        "text-primary": "#192B24",
        "text-secondary": "#62746B",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626"
      },
      boxShadow: {
        card: "0 1px 3px rgba(25, 43, 36, 0.035)"
      },
      borderRadius: {
        lg: "12px",
        xl: "16px"
      }
    },
  },
  plugins: [],
}
