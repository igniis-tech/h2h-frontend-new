import about from '../../assets/about.jpeg';
export default function About(){
  return (
    <section className="section bg-white" id="about">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-brandDark text-4xl font-bold leading-tight">About Higway To Heal</h2>
            <p className="text-black text-base leading-relaxed">
              Highway to Heal is an immersive music-travel experienc part road trip, part intimate live performanc designed to reset your soul in nature with your favorite artists.

                  What it aims to do

                  Bring fans and artists face-to-face outdoors

                  Go beyond conventional stage shows with intimate, unplugged moments

                  Let you share your stories with the artists

                  Rekindle 90s/2000s nostalgia

                  Showcase artists’ latest work and make new memories

                  Travel alongside artists and enjoy live sets in scenic spots

                  Explore raw, untouched landscapes

                  Celebrate local culture and spotlight homegrown talent
            </p>
          </div>
          <div
            className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
            style={{
              backgroundImage: `url(${about})`
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
            <h2 className="font-display text-brandDark text-4xl font-bold leading-tight">Highway To Heal Volume 4.0</h2>
            <p className="text-black text-base leading-relaxed">
                Thanks for making Vol. 1.0–3.0 unforgettable. Built on your feedback, Vol. 4.0 is more intimate, immersive, and fun.

                What’s in store

                Special guests and surprise collabs

                Artist–fan sessions & Q&As

                Campfire jams, unplugged sets, and karaoke

                Bite-size workshops (rhythm, writing, storytelling)

                90s/2000s throwbacks + fresh releases

                Spotlight on emerging indie talent

                Whether you’re into chill stays, backpacking vibes, great food, deep music, or arts & culture—there’s a lane for you.
                            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
