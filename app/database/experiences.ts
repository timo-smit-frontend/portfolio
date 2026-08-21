export type ExperienceProject = {
  image: string
  title: string
  role?: string
  width: number
  height: number
  description: string
}

export type Experience = {
  image: string
  title: string
  width: number
  height: number
  description: string
  link?: string
  projects?: ExperienceProject[]
}

export const EXPERIENCES: Experience[] = [
  {
    image: '/images/logo/ubo.png',
    title: 'UBO Agency',
    width: 310,
    height: 163,
    description:
      'I joined the UBO development team to sharpen my skills as a developer, with a strong focus on improving my coding abilities, while also having the opportunity to contribute to accessibility efforts by being the switch between the developers and the designers.',
    link: 'https://ubo.agency',
    projects: [
      {
        image: '/images/logo/casio.svg',
        title: 'Casio LMS',
        role: 'Front-end developer (Accessibility)',
        width: 177,
        height: 32,
        description:
          "I worked on Casio's learning platform, focusing on accessibility in the React frontend and the login theme. Contrast, focus outlines, and making the LMS usable for more people. Same accessibility thread I picked up at the Tweede Kamer."
      },
      {
        image: '/images/logo/fairbanks.svg',
        title: 'Fairbanks',
        role: 'Front-end developer',
        width: 158,
        height: 31,
        description:
          'I spent a large part of my time on Fairbanks, a Dutch IT consultancy. I built and iterated on their multilingual Remix site: knowledge base, keynotes, language switching, and motion on forms.'
      },
      {
        image: '/images/logo/movimento.svg',
        title: 'Movimento',
        role: 'Front-end developer',
        width: 178,
        height: 34,
        description:
          'For Movimento, a healthcare recruitment agency, I worked on their Remix site and the job application flow, including how candidates get assigned from vacancies, plus accessibility and animation polish.'
      },
      {
        image: '/images/logo/brouwer-metaal.svg',
        title: 'Brouwer Metaal',
        role: 'Front-end developer',
        width: 294,
        height: 35,
        description:
          "I developed Brouwer Metaal's international site, including interactive 3D product models, quote requests, and translations across English, French, German, Portuguese, and Spanish."
      },
      {
        image: '/images/logo/im-duurzaam.svg',
        title: 'IM Duurzaam',
        role: 'Front-end developer',
        width: 473,
        height: 380,
        description:
          "I shipped IM Duurzaam's Remix site with GSAP-driven motion, sliders, and an English translation, for a sustainability brand where animation and content structure had to work together."
      }
    ]
  },
  {
    title: 'Capgemini',
    image: '/images/logo/capgemini.svg',
    width: 1024,
    height: 239,
    description:
      "For about a year, I've been part of Capgemini, working on exciting projects and gaining valuable experience. I've dedicated much of my time to mastering React and Next.js while developing my skills as a consultant. Additionally, I've had the privilege of staying connected to my creative side by focusing on user experience and accessibility.",
    projects: [
      {
        image: '/images/logo/tweede-kamer.png',
        title: 'Tweede Kamer der Staten-Generaal',
        role: 'Next Developer (Accessibility)',
        width: 1200,
        height: 339,
        description:
          'I took on a project for the Tweede Kamer focused solely on accessibility. This was motivated by my desire to stay connected to my creative background while also expanding my skill set and expertise. By researching WCAG, creating an accessibility plan and implementing the changes in React/Next.js.'
      },
      {
        image: '/images/logo/wfp.webp',
        title: 'Project Enhance',
        role: 'React Developer',
        width: 360,
        height: 167,
        description:
          'I had the pleasure of being part of project Enhance. Working together with the World Food Program, I mainly focused on optimizing the website, increasing efficiency and improving the user experience.'
      }
    ]
  },
  {
    image: '/images/logo/accent-interactive.png',
    title: 'Accent Interactive',
    width: 4500,
    height: 1458,
    description:
      'At Accent Interactive, an e-commerce agency based in Alphen aan den Rijn. Working alongside developers, I contributed user-centered design solutions while simultaneously growing my frontend development skills. My responsibilities included updating code and revamping the PlanAhead planning system for clients such as ProRail. Beyond visual design, I fully developed the frontend for a new version of the platform using Laravel and SCSS. This experience provided me with a deeper understanding of the development process and strengthened my ability to connect design with technical implementation.',
    link: 'https://accentinteractive.nl'
  },
  {
    image: '/images/logo/smart-hotel.png',
    title: 'SmartHOTEL',
    width: 1000,
    height: 215,
    description:
      "I had the opportunity to be part of SmartHOTEL, a hospitality tech company based in Reeuwijk. In this role, I focused on enhancing the user experience of their digital platforms through user-centered design research. SmartHOTEL gave me the freedom to apply and expand my knowledge by working on their existing designs and communication strategies. Using tools such as Figma, I created a modern, vibrant, and engaging interface, which not only improved usability but also brought a fresh, lively feel to the brand's visual identity.",
    link: 'https://www.smarthotel.nl/'
  }
]
