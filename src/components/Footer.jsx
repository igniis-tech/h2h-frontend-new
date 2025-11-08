import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-0.8 border-t border-slate-0.8 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 text-slate-600 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p> {new Date().getFullYear()} Highway to Heal. All rights reserved.</p>
        <div className="flex flex-col sm:items-end gap-1">
          <p className="opacity-90">
            Purulia, Barabhum • 24–26 Jan • <a
              className="text-primary hover:text-primary/90 underline"
              href="https://www.google.com/maps/dir//Sonkupi%20Banjara%20camp%20,%20Bagmundi%20Purulia" target="_blank" rel="noreferrer">Google Map</a>
          </p>
          <p className="opacity-90">
            <Link to="/policy" className="text-primary hover:text-primary/90 underline">Privacy Policy</Link>
            <span className="mx-2">•</span>
            <Link to="/refund" className="text-primary hover:text-primary/90 underline">Cancellation & Refund</Link>
            <span className="mx-2">•</span>
            <Link to="/members" className="text-primary hover:text-primary/90 underline">Members</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
