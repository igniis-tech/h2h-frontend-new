export default function About(){
  return (
    <section className="section bg-white" id="about">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-brandDark text-4xl font-black leading-tight tracking-[-0.033em]">About The Event</h2>
            <p className="text-brandDark/70 text-base leading-relaxed">
              Embark on a transformative journey at Highway to Heal, where the rhythm of music,
              the serenity of nature, and the spirit of adventure converge. Our mission is to
              create an immersive experience that rejuvenates the soul. Expect stunning landscapes,
              captivating performances, and a community connected by a shared love for exploration and healing.
            </p>
          </div>
          <div
            className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAyKPA0hz_GXsIfr_MgE8FiCN5jpCTjvBvpl9qDX1ybVQssoyfjmGb7cjYj6euFQG8jCeA9X4RgO_3VWArK1BYpLUA9lJSGdz99URvklS7vngQ9t_PdhRsBFxp3VtLr18tlSuc11xla-V4_DE0041ekJmg_hryXtNq-EZG5GA8bXIchYe9QllUb4WCoss0BVFg7q2J2w0K4bSrX-BuF9FSzfxmxt_s9jQJJDTfV_QZnjBEteaah68hK_VUDQ6MM1ukLIEgI0h7Fp6I')"
            }}
          />
        </div>
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div
            className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl md:order-2"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAjDitMr41r6uIi12A-VLe7fGCLBr_oIW_Mb3ehmLnaYbhPWv0uinvw8eSpQDHkboh2mNwPDitEy1gqmwmYX55t8nUk1ztCa6ISxfmR--eHs4ox5zVGpTp1SqYxs-aJvSBp96AlZV4u_PvOAH74bnUOkB7bddwnagFIP8gRpPHnReoD-tX3hmO9EaRuw7CwsTRnh_l9ydIBYlqaikI6EA1dIvVCZ0gnPnBLY5YZT3hAGv9q2nXhHgsw964GjE-kwqqzajm9ePAkPqE')"
            }}
          />
          <div className="flex flex-col gap-4 md:order-1">
            <h3 className="font-display text-brandDark text-2xl font-bold leading-tight">Community & Connection</h3>
            <p className="text-brandDark/70 text-base leading-relaxed">
              From sunrise yoga sessions to late-night jam sessions under the stars, every moment is curated
              to inspire and delight. Join a vibrant community of fellow travelers, artists, and nature lovers
              to share stories and create lasting memories that will echo long after the road ends.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
