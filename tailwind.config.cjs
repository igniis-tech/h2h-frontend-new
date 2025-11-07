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
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        kenburns: {
          '0%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1.12)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'blur-in': {
          '0%': { opacity: '0', filter: 'blur(8px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        'flip-in': {
          '0%': { opacity: '0', transform: 'rotateX(-90deg) translateY(6px)' },
          '100%': { opacity: '1', transform: 'rotateX(0) translateY(0)' },
        },
        'pulse-scale': {
          '0%':   { transform: 'scale(1)' },
          '35%':  { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'fade-in': 'fade-in 0.6s ease-out both',
        kenburns: 'kenburns 18s ease-in-out infinite alternate',
        floaty: 'floaty 3s ease-in-out infinite',
        'blur-in': 'blur-in 0.8s ease-out both',
        'flip-in': 'flip-in 650ms cubic-bezier(0.2, 0.6, 0.2, 1) both',
        'pulse-scale-once': 'pulse-scale 850ms ease-out 1 both',
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
