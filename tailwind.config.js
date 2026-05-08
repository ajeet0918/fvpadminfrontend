/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#166534",
        "brand-light": "#DCFCE7",
        app: "#F9FAFB",
        card: "#FFFFFF",
        border: "#E5E7EB",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626"
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 24, 39, 0.06), 0 8px 16px rgba(17, 24, 39, 0.04)"
      },
      borderRadius: {
        lg: "12px",
        xl: "16px"
      }
    },
  },
  plugins: [],
}
