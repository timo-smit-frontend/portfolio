import type { LocalizedCopy } from './experiences'

const PLACEHOLDER = '/images/education/placeholder.svg'

export const EDUCATIONS = {
  accessibility: {
    title: { en: 'Accessibility', nl: 'Toegankelijkheid' } satisfies LocalizedCopy,
    description: {
      en: `<p>Accessibility started during my bachelor in <strong>Communication and Multimedia Design</strong> at the University of Applied Sciences in Amsterdam, where user experience and inclusive design were part of how I learned to build. I later added <strong>Creating Accessible Websites</strong> on Udemy and <strong>WAI0.1x: Introduction to Web Accessibility</strong> on edX.</p>
      <p>At <strong>Capgemini</strong> I took on a project for the <strong>Tweede Kamer der Staten-Generaal</strong> as accessibility expert, developer, and consultant. I researched <strong>WCAG</strong>, wrote an improvement plan, and implemented it in <strong>React</strong> and <strong>Next.js</strong>.</p>
      <p>At <strong>UBO Agency</strong> I am the switch between developers and designers, so accessibility stays in the work instead of landing as an afterthought. On <strong>Casio</strong>'s learning platform I worked on contrast, focus outlines, and the login theme in the React frontend. Same thread as the Tweede Kamer, applied to a live LMS.</p>`,
      nl: `<p>Toegankelijkheid begon tijdens mijn bachelor <strong>Communication and Multimedia Design</strong> aan de Hogeschool van Amsterdam, waar user experience en inclusive design onderdeel waren van hoe ik leerde bouwen. Daarna volgde ik <strong>Creating Accessible Websites</strong> op Udemy en <strong>WAI0.1x: Introduction to Web Accessibility</strong> op edX.</p>
      <p>Bij <strong>Capgemini</strong> nam ik een project voor de <strong>Tweede Kamer der Staten-Generaal</strong> op me als toegankelijkheidsexpert, developer en consultant. Ik onderzocht <strong>WCAG</strong>, schreef een verbeterplan en voerde het uit in <strong>React</strong> en <strong>Next.js</strong>.</p>
      <p>Bij <strong>UBO Agency</strong> ben ik de schakel tussen developers en designers, zodat toegankelijkheid in het werk blijft in plaats van achteraf. Op het leerplatform van <strong>Casio</strong> werkte ik aan contrast, focus outlines en het loginthema in de React-frontend. Dezelfde lijn als bij de Tweede Kamer, toegepast op een live LMS.</p>`
    } satisfies LocalizedCopy,
    image: '/images/accessibility_presentation.jpg'
  },
  reactNextjs: {
    title: { en: 'React & Next.js', nl: 'React & Next.js' } satisfies LocalizedCopy,
    description: {
      en: `<p>I spent a lot of time on <strong>React</strong> and <strong>Next.js</strong>, including <strong>React - The Complete Guide (2024 Edition)</strong> on Udemy. I also studied <strong>Angular</strong> through Udemy's Complete Guide, which helps when a stack is not React.</p>
      <p>At <strong>Capgemini</strong> I used React and Next.js daily. On <strong>Project Enhance</strong> for the World Food Programme I focused on performance and UX. For the <strong>Tweede Kamer</strong> I built the frontend in React and Next.js around WCAG.</p>
      <p>At <strong>UBO Agency</strong> I still work in React, including Casio's LMS, and in Remix on Fairbanks, Movimento, and IM Duurzaam. Same component thinking, different framework.</p>`,
      nl: `<p>Ik heb veel tijd in <strong>React</strong> en <strong>Next.js</strong> gestoken, waaronder <strong>React - The Complete Guide (2024 Edition)</strong> op Udemy. Ik studeerde ook <strong>Angular</strong> via Udemy's Complete Guide, wat helpt als de stack geen React is.</p>
      <p>Bij <strong>Capgemini</strong> gebruikte ik React en Next.js dagelijks. Op <strong>Project Enhance</strong> voor het World Food Programme lag de focus op performance en UX. Voor de <strong>Tweede Kamer</strong> bouwde ik de frontend in React en Next.js rond WCAG.</p>
      <p>Bij <strong>UBO Agency</strong> werk ik nog steeds in React, onder meer op het LMS van Casio, en in Remix op Fairbanks, Movimento en IM Duurzaam. Dezelfde componentgedachte, ander framework.</p>`
    } satisfies LocalizedCopy,
    image: PLACEHOLDER
  },
  ai: {
    title: { en: 'Artificial Intelligence', nl: 'Kunstmatige intelligentie' } satisfies LocalizedCopy,
    description: {
      en: `<p>Artificial intelligence came into the work after my bachelor, once I was shipping every day. Across about <strong>three years</strong> of professional front-end — a year at <strong>Capgemini</strong>, then <strong>UBO Agency</strong> — I learned to use it as a pair, not a replacement: faster on React and Remix, still responsible for what goes live.</p>
      <p>At <strong>UBO Agency</strong> that is part of how we deliver. Client work like <strong>Fairbanks</strong>, <strong>Movimento</strong>, <strong>Casio</strong>, and <strong>Profield</strong> still needs accessibility, motion, and a frontend that holds up. Artificial intelligence helps me get there. It does not skip <strong>WCAG</strong>, content, or the designer-developer conversation.</p>
      <p>I keep learning it the same way I learned React: on real projects, then tightening the craft. The puzzle is still the puzzle. Artificial intelligence just lets me try more pieces before the deadline.</p>`,
      nl: `<p>Kunstmatige intelligentie kwam in het werk na mijn bachelor, toen ik elke dag aan het shippen was. In ongeveer <strong>drie jaar</strong> professionele front-end — een jaar bij <strong>Capgemini</strong>, daarna <strong>UBO Agency</strong> — leerde ik het als sparringpartner te gebruiken, niet als vervanging: sneller op React en Remix, nog steeds verantwoordelijk voor wat live gaat.</p>
      <p>Bij <strong>UBO Agency</strong> is dat onderdeel van hoe we leveren. Opdrachtwerk zoals <strong>Fairbanks</strong>, <strong>Movimento</strong>, <strong>Casio</strong> en <strong>Profield</strong> vraagt nog steeds om toegankelijkheid, motion en een frontend die overeind blijft. Kunstmatige intelligentie helpt me daar. Het slaat <strong>WCAG</strong>, content of het gesprek tussen design en development niet over.</p>
      <p>Ik leer het hetzelfde als React: op echte projecten, daarna het vak aanscherpen. De puzzel blijft de puzzel. Kunstmatige intelligentie laat me alleen meer stukjes proberen voor de deadline.</p>`
    } satisfies LocalizedCopy,
    image: PLACEHOLDER
  },
  consultancy: {
    title: { en: 'Consultancy & client work', nl: 'Consultancy & opdrachtgevers' } satisfies LocalizedCopy,
    description: {
      en: `<p>At <strong>Capgemini</strong> I learned consultancy on real client work: talking to stakeholders, reading complex requirements, and getting the work live. That included <strong>Project Enhance</strong> with the <strong>United Nations World Food Programme</strong>, focused on performance and user experience, and the Tweede Kamer accessibility project.</p>
      <p>At <strong>UBO Agency</strong> the client mix is wide. Featured work includes <strong>Fairbanks</strong> (multilingual Remix), <strong>Movimento</strong> (healthcare recruitment and job applications), <strong>Casio</strong> (accessibility), <strong>Brouwer Metaal</strong> (international site with 3D product models), and <strong>IM Duurzaam</strong> (GSAP motion). I have also worked with tech companies like NTT DATA and Worldstream, and notaries such as Van Eeten and Hak en Rein Vos. Artificial intelligence is in how I ship that mix, not a separate service I sell.</p>
      <p>I took Coursera courses in <strong>Giving Helpful Feedback</strong>, <strong>High-Impact Business Writing</strong>, and <strong>Teamwork Skills</strong>. Clear communication is part of the job, not extra.</p>`,
      nl: `<p>Bij <strong>Capgemini</strong> leerde ik consultancy op echt opdrachtwerk: praten met stakeholders, complexe requirements lezen en het werk live krijgen. Dat omvatte <strong>Project Enhance</strong> met het <strong>United Nations World Food Programme</strong>, gericht op performance en user experience, en het toegankelijkheidsproject voor de Tweede Kamer.</p>
      <p>Bij <strong>UBO Agency</strong> is de mix van opdrachtgevers breed. Onder meer <strong>Fairbanks</strong> (meertalige Remix), <strong>Movimento</strong> (werving in de zorg en sollicitaties), <strong>Casio</strong> (toegankelijkheid), <strong>Brouwer Metaal</strong> (internationale site met 3D-productmodellen) en <strong>IM Duurzaam</strong> (GSAP-motion). Ik werkte ook met techbedrijven zoals NTT DATA en Worldstream, en notarissen zoals Van Eeten en Hak en Rein Vos. Kunstmatige intelligentie zit in hoe ik die mix ship, niet als een losse dienst die ik verkoop.</p>
      <p>Ik volgde Coursera-cursussen in <strong>Giving Helpful Feedback</strong>, <strong>High-Impact Business Writing</strong> en <strong>Teamwork Skills</strong>. Duidelijk communiceren hoort bij het werk, het is geen extraatje.</p>`
    } satisfies LocalizedCopy,
    image: PLACEHOLDER
  },
  creativeDeveloper: {
    title: { en: 'Creative background', nl: 'Creatieve achtergrond' } satisfies LocalizedCopy,
    description: {
      en: `<p>During <strong>Communication and Multimedia Design</strong> at the University of Applied Sciences in Amsterdam I became a UX/UI designer and a front-end developer in one. I graduated in June 2023. That mix is still the core: creative development with user experience and accessibility in the middle.</p>
      <p>At <strong>SmartHOTEL</strong> I used Figma and user-centered research to refresh their digital platforms. At <strong>Accent Interactive</strong> I sat with developers, designed, and built frontend in Laravel and SCSS, including a new version of PlanAhead for clients such as ProRail.</p>
      <p><strong>Capgemini</strong> then pushed the React and Next.js side, including the World Food Programme and the Tweede Kamer. At <strong>UBO Agency</strong> I keep both sides: motion and 3D on sites like IM Duurzaam and Brouwer Metaal, and the designer-developer bridge on accessibility. To me, coding is like putting together a puzzle. Adding creativity and aiming to make something that brings happiness makes the process special.</p>`,
      nl: `<p>Tijdens <strong>Communication and Multimedia Design</strong> aan de Hogeschool van Amsterdam werd ik UX/UI-designer en front-end developer ineen. Ik studeerde af in juni 2023. Die mix is nog steeds de kern: creative development met user experience en toegankelijkheid in het midden.</p>
      <p>Bij <strong>SmartHOTEL</strong> gebruikte ik Figma en user-centered research om hun digitale platforms te vernieuwen. Bij <strong>Accent Interactive</strong> zat ik naast developers, ontwierp ik en bouwde ik frontend in Laravel en SCSS, onder meer een nieuwe versie van PlanAhead voor opdrachtgevers zoals ProRail.</p>
      <p><strong>Capgemini</strong> duwde daarna de React- en Next.js-kant, inclusief het World Food Programme en de Tweede Kamer. Bij <strong>UBO Agency</strong> houd ik beide kanten: motion en 3D op sites zoals IM Duurzaam en Brouwer Metaal, en de brug tussen design en development op toegankelijkheid. Voor mij is coderen als een puzzel. Creativiteit toevoegen en iets maken dat blij maakt, maakt het proces bijzonder.</p>`
    } satisfies LocalizedCopy,
    image: PLACEHOLDER
  }
}
