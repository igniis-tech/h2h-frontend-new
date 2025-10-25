import PackageGrid from './PackageGrid'

export default function Pricing(){
  return (
    <section className="bg-white py-20 sm:py-28" id="pricing">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h2 className="font-display text-brandDark text-4xl font-black leading-tight tracking-[-0.033em]">Secure Your Spot</h2>
          <p className="text-brandDark/70 mt-2">Choose your path on the highway to heal.</p>
        </div>
        <PackageGrid />
      </div>
    </section>
  )
}
