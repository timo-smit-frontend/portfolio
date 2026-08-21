import type { Locale } from './locale'

const en = {
  lang: {
    switch: 'Language'
  },
  skip: 'Skip to main content',
  image: {
    alt: 'Portrait of Timo Smit'
  },
  nav: {
    home: 'Home',
    experience: 'Experience',
    education: 'Education',
    contact: 'Contact',
    getInTouch: 'Get in touch',
    menu: 'Menu',
    primary: 'Primary',
    siteNavigation: 'Site navigation',
    open: 'Open menu',
    close: 'Close menu'
  },
  footer: {
    menu: 'Menu',
    follow: 'Follow me',
    linkedInNewTab: ' (opens in a new tab)'
  },
  hero: {
    kicker: 'Front-end developer at UBO Agency',
    srTitle: 'Timo Smit is a creative Front-end Developer',
    beforeTrait: 'Timo Smit is a ',
    afterTrait: 'Front-end Developer!'
  },
  logos: {
    label: 'Projects and collaborations.'
  },
  cta: {
    title: 'Want to know more about me?',
    description: 'Questions about my work, accessibility, or a project? Send me a message.'
  },
  story: {
    paragraphs: [
      'Hey everyone, welcome to my portfolio. I am a Front-end Developer currently working for <strong>UBO Agency</strong>. In june 2023 I finished my bachelor <strong>Communication and Multimedia Design</strong> at the University of Applied Sciences in Amsterdam. During my studies I became a UX/UI designer and a Front-end Developer in one. Making me a creative developer with user experience and accessibility at my core.',
      'After my studies I started working for <strong>Capgemini Netherlands B.V.</strong> for about a year. This is where I strenghtened my development and consultant skills. I got to work for clients like <strong>United Nations World Food Programme</strong> &<strong> Tweede Kamer der Staten-Generaal</strong>. Learning and consulting alot about React, Next but also accessibility and design.',
      "To me, coding is like putting together a puzzle, a challenging task that's intriguing to solve. Adding creativity and aiming to make something that brings happiness makes the whole process special. Creating something I like and seeing how it affects others is really satisfying."
    ]
  },
  experience: {
    title: 'My professional front-end experiences',
    description: 'UBO Agency, Capgemini, Accent Interactive, and SmartHOTEL.',
    employers: 'Employers'
  },
  education: {
    title: 'Education',
    description: 'Accessibility, React / Next.js, Artificial Intelligence, Communication and Multimedia Design, and consultancy.'
  },
  contact: {
    title: 'Get in touch',
    description: 'Questions about my work, accessibility, or a project? Send me a message.',
    heading: 'Contact',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    company: 'Company',
    send: 'Send message',
    sending: 'Sending…',
    success: 'Thanks! I will get back to you soon.',
    error: 'Something went wrong. Try again later.',
    nameHint: "Don't forget to add your name.",
    emailHint: "Don't forget to add your email.",
    emailInvalidHint: "That doesn't look like a valid email, try name@example.com.",
    messageHint: "Don't forget to add your message.",
    subject: (name: string) => `Portfolio message from ${name}`
  },
  error: {
    title: 'This page was not found',
    description: 'This page does not exist or has been moved.',
    back: 'Back to home'
  },
  selectedWork: {
    title: 'Selected work',
    view: 'View experience →'
  },
  seo: {
    homeTitle: 'Timo Smit | Front-end Developer',
    homeDescription: 'The portfolio of Timo Smit, a front-end developer working at UBO Agency.',
    experienceTitle: 'Experience',
    experienceDescription: 'Front-end work at UBO Agency, Capgemini, Accent Interactive, and SmartHOTEL.',
    educationTitle: 'Education',
    educationDescription: 'Accessibility, React / Next.js, Artificial Intelligence, Communication and Multimedia Design, and consultancy.',
    contactTitle: 'Contact',
    contactDescription: 'Send Timo Smit a message about work, accessibility, or a project.',
    notFoundTitle: 'Page not found',
    notFoundDescription: 'This page does not exist or has been moved.',
    jobTitle: 'Front-end Developer'
  },
  traits: [
    'creative',
    'proactive',
    'cool',
    'motivated',
    'social',
    'enthusiastic',
    'happy',
    'nerdy',
    'respectable',
    'weird',
    'funny',
    'adventurous',
    'surprising',
    'badass',
    'fashionable',
    'inventive',
    'playful',
    'daring',
    'charismatic',
    'eccentric',
    'optimistic',
    'lively',
    'spirited',
    'humorous',
    'imaginative',
    'bold',
    'artistic',
    'dreamy',
    'intuitive',
    'spontaneous',
    'compassionate',
    'kind-hearted',
    'energetic',
    'dynamic',
    'sympathetic'
  ]
}

const nl: typeof en = {
  lang: {
    switch: 'Taal'
  },
  skip: 'Ga naar de inhoud',
  image: {
    alt: 'Portret van Timo Smit'
  },
  nav: {
    home: 'Home',
    experience: 'Ervaring',
    education: 'Opleiding',
    contact: 'Contact',
    getInTouch: 'Neem contact op',
    menu: 'Menu',
    primary: 'Hoofdmenu',
    siteNavigation: 'Sitenavigatie',
    open: 'Menu openen',
    close: 'Menu sluiten'
  },
  footer: {
    menu: 'Menu',
    follow: 'Volg me',
    linkedInNewTab: ' (opent in een nieuw tabblad)'
  },
  hero: {
    kicker: 'Front-end developer bij UBO Agency',
    srTitle: 'Timo Smit is een creatieve front-end developer',
    beforeTrait: 'Timo Smit is een ',
    afterTrait: 'front-end developer!'
  },
  logos: {
    label: 'Projecten en samenwerkingen.'
  },
  cta: {
    title: 'Meer over mij weten?',
    description: 'Vragen over mijn werk, toegankelijkheid of een project? Stuur me een bericht.'
  },
  story: {
    paragraphs: [
      'Hey iedereen, welkom op mijn portfolio. Ik ben front-end developer en werk momenteel bij <strong>UBO Agency</strong>. In juni 2023 rondde ik mijn bachelor <strong>Communication and Multimedia Design</strong> af aan de Hogeschool van Amsterdam. Tijdens mijn studie werd ik UX/UI-designer en front-end developer ineen. Daarmee ben ik een creative developer met user experience en toegankelijkheid als kern.',
      'Na mijn studie ging ik ongeveer een jaar aan de slag bij <strong>Capgemini Netherlands B.V.</strong> Daar versterkte ik mijn development- en consultancyskills. Ik werkte voor opdrachtgevers zoals <strong>United Nations World Food Programme</strong> en <strong>Tweede Kamer der Staten-Generaal</strong>. Veel geleerd en geadviseerd over React, Next, maar ook toegankelijkheid en design.',
      'Voor mij is coderen als een puzzel: een uitdagende klus die leuk is om op te lossen. Creativiteit toevoegen en iets maken dat blij maakt, maakt het hele proces bijzonder. Iets maken waar ik zelf blij van word en zien hoe het anderen raakt, is echt bevredigend.'
    ]
  },
  experience: {
    title: 'Mijn professionele front-end ervaringen',
    description: 'UBO Agency, Capgemini, Accent Interactive en SmartHOTEL.',
    employers: 'Werkgevers'
  },
  education: {
    title: 'Opleiding',
    description: 'Toegankelijkheid, React / Next.js, kunstmatige intelligentie, Communication and Multimedia Design en consultancy.'
  },
  contact: {
    title: 'Neem contact op',
    description: 'Vragen over mijn werk, toegankelijkheid of een project? Stuur me een bericht.',
    heading: 'Contact',
    name: 'Naam',
    email: 'E-mail',
    message: 'Bericht',
    company: 'Bedrijf',
    send: 'Verstuur bericht',
    sending: 'Versturen…',
    success: 'Bedankt! Ik neem zo snel mogelijk contact met je op.',
    error: 'Er ging iets mis. Probeer het later opnieuw.',
    nameHint: 'Vergeet niet je naam in te vullen.',
    emailHint: 'Vergeet niet je e-mailadres in te vullen.',
    emailInvalidHint: 'Dat lijkt geen geldig e-mailadres, probeer naam@voorbeeld.com.',
    messageHint: 'Vergeet niet je bericht in te vullen.',
    subject: (name: string) => `Portfoliobericht van ${name}`
  },
  error: {
    title: 'Deze pagina is niet gevonden',
    description: 'Deze pagina bestaat niet of is verplaatst.',
    back: 'Terug naar home'
  },
  selectedWork: {
    title: 'Geselecteerd werk',
    view: 'Bekijk ervaring →'
  },
  seo: {
    homeTitle: 'Timo Smit | Front-end Developer',
    homeDescription: 'Het portfolio van Timo Smit, front-end developer bij UBO Agency.',
    experienceTitle: 'Ervaring',
    experienceDescription: 'Front-endwerk bij UBO Agency, Capgemini, Accent Interactive en SmartHOTEL.',
    educationTitle: 'Opleiding',
    educationDescription:
      'Toegankelijkheid, React / Next.js, kunstmatige intelligentie, Communication and Multimedia Design en consultancy.',
    contactTitle: 'Contact',
    contactDescription: 'Stuur Timo Smit een bericht over werk, toegankelijkheid of een project.',
    notFoundTitle: 'Pagina niet gevonden',
    notFoundDescription: 'Deze pagina bestaat niet of is verplaatst.',
    jobTitle: 'Front-end developer'
  },
  traits: [
    'creatieve',
    'proactieve',
    'coole',
    'gemotiveerde',
    'sociale',
    'enthousiaste',
    'vrolijke',
    'nerdige',
    'respectabele',
    'rare',
    'grappige',
    'avontuurlijke',
    'verrassende',
    'stoere',
    'stijlvolle',
    'vindingrijke',
    'speelse',
    'gedurfde',
    'charismatische',
    'excentrieke',
    'optimistische',
    'levendige',
    'bevlogen',
    'humoristische',
    'fantasierijke',
    'brutale',
    'artistieke',
    'dromerige',
    'intuïtieve',
    'spontane',
    'meelevende',
    'hartelijke',
    'energieke',
    'dynamische',
    'sympathieke'
  ]
}

export const messages: Record<Locale, typeof en> = { en, nl }
export type Messages = typeof en
