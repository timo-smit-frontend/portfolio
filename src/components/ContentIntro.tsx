import Socials from './elements/Socials'

export default function ContentIntro() {
  return (
    <section className="section flex justify-center">
      <div className="container">
        <div className="flex flex-col items-center">
          <div className="flex flex-col gap-4">
            <p className="flex flex-col gap-4 lg:max-w-190 text-lg">
              <span>
                Hey everyone, welcome to my portfolio. I am a Front-end Developer currently working for <strong>UBO Agency</strong>. In june
                2023 I finished my bachelor <strong>Communication and Multimedia Design</strong> at the University of Applied Sciences in
                Amsterdam. During my studies I became a UX/UI designer and a Front-end Developer in one. Making me a creative developer with
                user experience and accessibility at my core.
              </span>
              <span>
                After my studies I started working for <strong>Capgemini Netherlands B.V.</strong> for about a year. This is where I
                strenghtened my development and consultant skills. I got to work for clients like{' '}
                <strong>United Nations World Food Programme</strong> &<strong> Tweede Kamer der Staten-Generaal</strong>. Learning and
                consulting alot about React, Next but also accessibility and design.
              </span>
              <span>
                To me, coding is like putting together a puzzle, a challenging task that's intriguing to solve. Adding creativity and aiming
                to make something that brings happiness makes the whole process special. Creating something I like and seeing how it affects
                others is really satisfying.
              </span>
            </p>
            <div className="flex flex-col gap-2">
              <span className="text-[var(--white)] text-lg font-semibold">Want to know more about me?</span>
              <Socials />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
