/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#147A46",
        "brand-light": "#EAF7EF",
        app: "#F5F8F6",
        card: "#FFFFFF",
        border: "#DCE7E0",
        "text-primary": "#17261E",
        "text-secondary": "#607269",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626"
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 47, 30, 0.04), 0 10px 28px rgba(15, 47, 30, 0.06)"
      },
      borderRadius: {
        lg: "12px",
        xl: "16px"
      }
    },
  },
  plugins: [],
}
