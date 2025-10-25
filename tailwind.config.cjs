/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Palette matched to the image
        primary:  "#D4AF37", // gold accent (buttons, highlights)
        brandDark:"#0E3D3E", // deep teal (dark sections)
        forest:   "#124239", // forest green (tints/dividers)
        earthy:   "#E6D9C4", // sand/tan (borders/cards)
        offwhite: "#F7F6F2", // paper

        // keep your other variants as-is if used elsewhere
        bookingPrimary: "#1179d4",
        dashPrimary:    "#1A3A3A"
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'], // headings like the poster
        body:    ['"Montserrat"', 'ui-sans-serif', 'system-ui', 'sans-serif'] // clean body
      },
      borderRadius: {
        xl: "0.75rem"
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
}
