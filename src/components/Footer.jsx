export default function Footer() {
  return (
    <footer className="mt-0.8 border-t border-slate-0.8 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 text-slate-600 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Highway to Heal. All rights reserved.</p>
        <p className="opacity-90">
          Purulia, Barabhum • 24–26 Jan • <a
            className="text-primary hover:text-primary/90 underline"
            href="https://www.google.com/maps/dir//Sonkupi%20Banjara%20camp%20,%20Bagmundi%20Purulia" target="_blank" rel="noreferrer">Google Map</a>
        </p>
      </div>
    </footer>
  )
}
