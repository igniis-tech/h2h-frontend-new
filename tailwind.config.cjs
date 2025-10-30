/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary:  "#D4AF37",
        brandDark:"#0E3D3E",
        forest:   "#124239",
        earthy:   "#E6D9C4",
        offwhite: "#F7F6F2",
        bookingPrimary: "#1179d4",
        dashPrimary:    "#1A3A3A",
        lightBack:"#ffffffff",
        blueback: "#ADD8E6",
      },
      fontFamily: {
        // default app font
        sans:   ['Roboto','ui-sans-serif','system-ui','-apple-system','Segoe UI','Helvetica Neue','Arial','Noto Sans','sans-serif'],
        // headings
        display:['Roboto','ui-sans-serif','system-ui','-apple-system','Segoe UI','Helvetica Neue','Arial','Noto Sans','sans-serif'],
        // body text
        body:   ['Roboto','ui-sans-serif','system-ui','-apple-system','Segoe UI','Helvetica Neue','Arial','Noto Sans','sans-serif'],
      },
      borderRadius: { xl: "0.75rem" },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
