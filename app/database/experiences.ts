import type { Locale } from '~/i18n/locale'

export type LocalizedCopy = Record<Locale, string>

export type ExperienceProject = {
  image: string
  title: string
  role?: LocalizedCopy
  width: number
  height: number
  description: LocalizedCopy
}

export type Experience = {
  image: string
  title: string
  width: number
  height: number
  description: LocalizedCopy
  link?: string
  projects?: ExperienceProject[]
}

export const EXPERIENCES: Experience[] = [
  {
    image: '/images/logo/ubo.png',
    title: 'UBO Agency',
    width: 310,
    height: 163,
    description: {
      en: 'I joined the UBO development team to sharpen my skills as a developer, with a strong focus on improving my coding abilities, while also having the opportunity to contribute to accessibility efforts by being the switch between the developers and the designers. Over these years AI became part of how I build: a pair on React and Remix, never a skip past accessibility or that designer conversation.',
      nl: 'Ik kwam bij het developmentteam van UBO om scherper te worden als developer, met veel aandacht voor mijn code, en de kans om aan toegankelijkheid te werken als schakel tussen developers en designers. In deze jaren werd AI onderdeel van hoe ik bouw: een extra paar ogen op React en Remix, nooit een omweg om toegankelijkheid of dat gesprek met design heen.'
    },
    link: 'https://ubo.agency',
    projects: [
      {
        image: '/images/logo/casio.svg',
        title: 'Casio LMS',
        role: { en: 'Front-end developer (Accessibility)', nl: 'Front-end developer (toegankelijkheid)' },
        width: 177,
        height: 32,
        description: {
          en: "I brought accessibility into Casio's learning platform, sitting between developers and designers so those choices actually made it into the React frontend. Contrast, focus, and the login theme on a live LMS people use to learn. A household name, and the same specialist work I did for the Tweede Kamer.",
          nl: 'Ik bracht toegankelijkheid in het leerplatform van Casio, tussen developers en designers zodat die keuzes ook echt in de React-frontend terechtkwamen. Contrast, focus en het loginthema op een live LMS waar mensen op leren. Een bekende naam, en hetzelfde specialistenwerk als bij de Tweede Kamer.'
        }
      },
      {
        image: '/images/logo/fairbanks.svg',
        title: 'Fairbanks',
        role: { en: 'Front-end developer', nl: 'Front-end developer' },
        width: 158,
        height: 31,
        description: {
          en: "I built Fairbanks' multilingual Remix site: knowledge base, keynotes, language switching, and motion on the forms. A full content platform for a Dutch IT consultancy, not a brochure. Frontend that has to look considered and still work when the content keeps moving. AI helped me move faster on that Remix work without losing the structure.",
          nl: 'Ik bouwde de meertalige Remix-site van Fairbanks: knowledge base, keynotes, taalswitch en motion op de formulieren. Een volledig contentplatform voor een Nederlandse IT-consultancy, geen brochure. Frontend die verzorgd moet ogen en blijven werken als de content blijft bewegen. AI hielp me sneller op Remix zonder de structuur te verliezen.'
        }
      },
      {
        image: '/images/logo/movimento.svg',
        title: 'Movimento',
        role: { en: 'Front-end developer', nl: 'Front-end developer' },
        width: 178,
        height: 34,
        description: {
          en: 'For Movimento I built the healthcare recruitment site and the path from vacancy to application, including how candidates get assigned. Accessibility and motion were part of that journey, not a polish pass. AI sped up the Remix side; the candidate-facing decisions stayed mine. Real product work, for people looking for a job in care.',
          nl: 'Voor Movimento bouwde ik de wervingssite in de zorg en het pad van vacature tot sollicitatie, inclusief hoe kandidaten worden toegewezen. Toegankelijkheid en motion zaten in die reis, niet als een laatste laag. AI versnelde de Remix-kant; de keuzes voor kandidaten bleven van mij. Echt productwerk, voor mensen die een baan in de zorg zoeken.'
        }
      },
      {
        image: '/images/logo/brouwer-metaal.svg',
        title: 'Brouwer Metaal',
        role: { en: 'Front-end developer', nl: 'Front-end developer' },
        width: 294,
        height: 35,
        description: {
          en: "I developed Brouwer Metaal's international site, with interactive 3D product models, quote requests, and translations in English, French, German, Portuguese, and Spanish. Visual and technical in one build. Manufacturing products you can turn around in the browser, for a brand that sells across Europe.",
          nl: 'Ik ontwikkelde de internationale site van Brouwer Metaal, met interactieve 3D-productmodellen, offertes en vertalingen in het Engels, Frans, Duits, Portugees en Spaans. Visueel en technisch in één build. Producten die je in de browser kunt ronddraaien, voor een merk dat door Europa verkoopt.'
        }
      },
      {
        image: '/images/logo/im-duurzaam.svg',
        title: 'IM Duurzaam',
        role: { en: 'Front-end developer', nl: 'Front-end developer' },
        width: 473,
        height: 380,
        description: {
          en: "I built IM Duurzaam's Remix site with motion that carries the story, not decoration on top. GSAP, sliders, and an English version, for a sustainability brand that needed the frontend to feel as considered as the work. Creative development in the open, not only in the design file. AI helped with the Remix scaffolding; the motion and the story were still mine to get right.",
          nl: 'Ik bouwde de Remix-site van IM Duurzaam met motion die het verhaal draagt, geen versiering eroverheen. GSAP, sliders en een Engelse versie, voor een duurzaamheidsmerk waarvan de frontend even doordacht moest voelen als het werk. Creative development in het open, niet alleen in het designbestand. AI hielp met de Remix-opzet; de motion en het verhaal bleven van mij.'
        }
      },
      {
        image: '/images/logo/profield.svg',
        title: 'Profield',
        role: { en: 'Front-end developer', nl: 'Front-end developer' },
        width: 845,
        height: 178,
        description: {
          en: 'For Profield I built vacancy search, the application flow, and an internal meetings dashboard on live data. Closer to a product than a brochure. Frontend recruiters and candidates depend on during a working day, including forms that have to submit and a dashboard that has to stay in sync. I used AI the same way I use any other tool: to ship the product, not to hide the work.',
          nl: 'Voor Profield bouwde ik vacaturezoeken, de sollicitatiestroom en een intern meetingdashboard op live data. Dichter bij een product dan een brochure. Frontend waar recruiters en kandidaten op een werkdag van afhankelijk zijn, inclusief formulieren die moeten versturen en een dashboard dat synchroon moet blijven. AI gebruikte ik zoals elk ander gereedschap: om het product te shippen, niet om het werk te verbergen.'
        }
      }
    ]
  },
  {
    title: 'Capgemini',
    image: '/images/logo/capgemini.svg',
    width: 1024,
    height: 239,
    description: {
      en: "For about a year, I've been part of Capgemini, working on exciting projects and gaining valuable experience. I've dedicated much of my time to mastering React and Next.js while developing my skills as a consultant. Additionally, I've had the privilege of staying connected to my creative side by focusing on user experience and accessibility.",
      nl: 'Ongeveer een jaar zat ik bij Capgemini, aan spannende projecten en met veel nieuwe ervaring. Ik besteedde veel tijd aan React en Next.js, en groeide als consultant. Daarnaast bleef ik bij mijn creatieve kant, met aandacht voor user experience en toegankelijkheid.'
    },
    projects: [
      {
        image: '/images/logo/tweede-kamer.png',
        title: 'Tweede Kamer der Staten-Generaal',
        role: { en: 'Next Developer (Accessibility)', nl: 'Next-developer (toegankelijkheid)' },
        width: 1200,
        height: 339,
        description: {
          en: 'I took on a project for the Tweede Kamer focused solely on accessibility. I researched WCAG, wrote an improvement plan, and implemented the changes in React and Next.js. Specialist work for the Dutch House of Representatives, on a site that has to work for everyone who wants to follow Dutch democracy.',
          nl: 'Ik nam een project voor de Tweede Kamer op me dat puur over toegankelijkheid ging. Ik onderzocht WCAG, schreef een verbeterplan en voerde de wijzigingen door in React en Next.js. Specialistenwerk voor de Tweede Kamer, op een site die moet werken voor iedereen die de Nederlandse democratie wil volgen.'
        }
      },
      {
        image: '/images/logo/wfp.webp',
        title: 'Project Enhance',
        role: { en: 'React Developer', nl: 'React-developer' },
        width: 360,
        height: 167,
        description: {
          en: 'I was part of Project Enhance with the World Food Programme, focused on performance and user experience. Making a UN platform faster and easier to use, on a large React site, for an organisation that operates worldwide.',
          nl: 'Ik werkte aan Project Enhance met het World Food Programme, gericht op performance en user experience. Een VN-platform sneller en prettiger maken, op een grote React-site, voor een organisatie die wereldwijd werkt.'
        }
      }
    ]
  },
  {
    image: '/images/logo/accent-interactive.png',
    title: 'Accent Interactive',
    width: 4500,
    height: 1458,
    description: {
      en: 'At Accent Interactive, an e-commerce agency based in Alphen aan den Rijn. Working alongside developers, I contributed user-centered design solutions while simultaneously growing my frontend development skills. My responsibilities included updating code and revamping the PlanAhead planning system for clients such as ProRail. Beyond visual design, I fully developed the frontend for a new version of the platform using Laravel and SCSS. This experience provided me with a deeper understanding of the development process and strengthened my ability to connect design with technical implementation.',
      nl: 'Bij Accent Interactive, een e-commercebureau in Alphen aan den Rijn, werkte ik naast developers aan user-centered design en groeide ik tegelijk in frontend. Ik werkte aan code-updates en een vernieuwing van het PlanAhead-planningsysteem voor opdrachtgevers zoals ProRail. Naast visueel design bouwde ik de frontend van een nieuwe versie van het platform in Laravel en SCSS. Die ervaring gaf me een scherper beeld van het ontwikkelproces en hoe design en techniek samenkomen.'
    },
    link: 'https://accentinteractive.nl'
  },
  {
    image: '/images/logo/smart-hotel.png',
    title: 'SmartHOTEL',
    width: 1000,
    height: 215,
    description: {
      en: "I had the opportunity to be part of SmartHOTEL, a hospitality tech company based in Reeuwijk. In this role, I focused on enhancing the user experience of their digital platforms through user-centered design research. SmartHOTEL gave me the freedom to apply and expand my knowledge by working on their existing designs and communication strategies. Using tools such as Figma, I created a modern, vibrant, and engaging interface, which not only improved usability but also brought a fresh, lively feel to the brand's visual identity.",
      nl: 'Ik mocht deel uitmaken van SmartHOTEL, een hospitality-techbedrijf in Reeuwijk. In die rol verbeterde ik de user experience van hun digitale platforms met user-centered designonderzoek. SmartHOTEL gaf me de ruimte om bestaande designs en communicatie verder te brengen. In Figma maakte ik een moderne, levendige interface die niet alleen bruikbaarder was, maar het merk ook een frisse visuele identiteit gaf.'
    },
    link: 'https://www.smarthotel.nl/'
  }
]
