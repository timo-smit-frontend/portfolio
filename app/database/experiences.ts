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
      'I joined the UBO development team to sharpen my skills as a developer, with a strong focus on improving my coding abilities, while also having the opportunity to contribute to accessibility efforts by being the switch between the developers and the designers. Over these years AI became part of how I build: a pair on React and Remix, never a skip past accessibility or that designer conversation.',
    link: 'https://ubo.agency',
    projects: [
      {
        image: '/images/logo/casio.svg',
        title: 'Casio LMS',
        role: 'Front-end developer (Accessibility)',
        width: 177,
        height: 32,
        description:
          "I brought accessibility into Casio's learning platform, sitting between developers and designers so those choices actually made it into the React frontend. Contrast, focus, and the login theme on a live LMS people use to learn. A household name, and the same specialist work I did for the Tweede Kamer."
      },
      {
        image: '/images/logo/fairbanks.svg',
        title: 'Fairbanks',
        role: 'Front-end developer',
        width: 158,
        height: 31,
        description:
          "I built Fairbanks' multilingual Remix site: knowledge base, keynotes, language switching, and motion on the forms. A full content platform for a Dutch IT consultancy, not a brochure. Frontend that has to look considered and still work when the content keeps moving. AI helped me move faster on that Remix work without losing the structure."
      },
      {
        image: '/images/logo/movimento.svg',
        title: 'Movimento',
        role: 'Front-end developer',
        width: 178,
        height: 34,
        description:
          'For Movimento I built the healthcare recruitment site and the path from vacancy to application, including how candidates get assigned. Accessibility and motion were part of that journey, not a polish pass. AI sped up the Remix side; the candidate-facing decisions stayed mine. Real product work, for people looking for a job in care.'
      },
      {
        image: '/images/logo/brouwer-metaal.svg',
        title: 'Brouwer Metaal',
        role: 'Front-end developer',
        width: 294,
        height: 35,
        description:
          "I developed Brouwer Metaal's international site, with interactive 3D product models, quote requests, and translations in English, French, German, Portuguese, and Spanish. Visual and technical in one build. Manufacturing products you can turn around in the browser, for a brand that sells across Europe."
      },
      {
        image: '/images/logo/im-duurzaam.svg',
        title: 'IM Duurzaam',
        role: 'Front-end developer',
        width: 473,
        height: 380,
        description:
          "I built IM Duurzaam's Remix site with motion that carries the story, not decoration on top. GSAP, sliders, and an English version, for a sustainability brand that needed the frontend to feel as considered as the work. Creative development in the open, not only in the design file. AI helped with the Remix scaffolding; the motion and the story were still mine to get right."
      },
      {
        image: '/images/logo/profield.svg',
        title: 'Profield',
        role: 'Front-end developer',
        width: 845,
        height: 178,
        description:
          'For Profield I built vacancy search, the application flow, and an internal meetings dashboard on live data. Closer to a product than a brochure. Frontend recruiters and candidates depend on during a working day, including forms that have to submit and a dashboard that has to stay in sync. I used AI the same way I use any other tool: to ship the product, not to hide the work.'
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
          'I took on a project for the Tweede Kamer focused solely on accessibility. I researched WCAG, wrote an improvement plan, and implemented the changes in React and Next.js. Specialist work for the Dutch House of Representatives, on a site that has to work for everyone who wants to follow Dutch democracy.'
      },
      {
        image: '/images/logo/wfp.webp',
        title: 'Project Enhance',
        role: 'React Developer',
        width: 360,
        height: 167,
        description:
          'I was part of Project Enhance with the World Food Programme, focused on performance and user experience. Making a UN platform faster and easier to use, on a large React site, for an organisation that operates worldwide.'
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
