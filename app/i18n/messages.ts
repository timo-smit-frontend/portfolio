import type { Locale } from './locale.ts'

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
    about: 'About',
    experience: 'Experience',
    education: 'Education',
    contact: 'Contact',
    getInTouch: 'Get in touch',
    menu: 'Menu',
    primary: 'Primary',
    siteNavigation: 'Site navigation',
    open: 'Open menu',
    close: 'Close menu',
    breadcrumb: 'Breadcrumb'
  },
  footer: {
    menu: 'Menu',
    follow: 'Follow me',
    linkedInNewTab: ' (opens in a new tab)'
  },
  hero: {
    kicker: 'Front-end developer',
    srTitle: 'Timo Smit is a creative Front-end Developer',
    beforeTrait: 'Timo Smit is a ',
    afterTrait: 'Front-end Developer!'
  },
  motion: {
    pause: 'Pause animations',
    play: 'Play animations',
    pauseHint: 'Stops the water, the fireflies, Byte and everything else that moves.',
    playHint: 'Brings the water, the fireflies and Byte back to life.'
  },
  logos: {
    label: 'Projects and collaborations.'
  },
  scroll: 'Scroll to discover',
  game: {
    start: 'Start exploring',
    welcome: 'Welcome to my town',
    intro:
      'Every building holds a part of my story. Walk around to explore, or switch on quick travel at the top to jump straight to a place.',
    mapLabel: 'Town map',
    controlsHint: 'Arrow keys or WASD to walk, Enter to interact. You can also click the map.',
    touchHint: 'Tap the map to walk, tap a building or character to interact.',
    roomControls: 'Arrow keys or WASD to walk, Enter to use what you face. The mat by the door leads outside.',
    roomControlsTouch: 'Tap the floor to walk, tap something to use it. The mat by the door leads outside.',
    keys: { move: 'Move', interact: 'Interact', travel: 'Travel', back: 'Leave' },
    places: {
      town: 'Town square',
      about: "Timo's house",
      experience: 'Work tower',
      education: 'Academy',
      contact: 'Post office'
    },
    placesNav: 'Places',
    prompt: {
      enter: 'Enter',
      read: 'Read the sign',
      talk: 'Talk to Byte',
      pet: 'Pet Pip',
      water: 'Look at the water'
    },
    /** The pond: say yes and Byte turns into a boat (an easter egg, not a quest). */
    pond: {
      ask: ['The pond glitters in the moonlight. Somewhere a frog croaks.', 'Would you like to go out on the water?'],
      yes: 'Yes, set sail!',
      no: 'Not now',
      aboard: [
        'Beep boop! Boat mode: on. All aboard, captain!',
        'Steer with the arrow keys, or tap the water. Sail into the shore to hop off.'
      ]
    },
    signs: {
      about: "Timo's house. Who he is, how he works and the brands he has built for.",
      experience: 'Work tower. Every job and project, floor by floor.',
      education: 'Academy. Courses, certificates and what he learned on the job.',
      contact: 'Post office. Drop Timo a line, he reads every letter.'
    },
    robot: [
      'Beep boop! I am Byte, the guide of this town.',
      'Timo Smit lives and works here. Every building tells part of his story.',
      'Walk into a door to go inside. Want to go faster? Switch on quick travel at the top for a travel bar at the bottom and the number keys 1 to 5.',
      "Oh, and Timo's cat Pip is napping in the garden next to his house. Go say hi!"
    ],
    /** After the first chat, Byte has a new tip every time you talk to him. */
    robotTips: [
      'Tip: tap an arrow key (or W, A, S, D) to turn on the spot. Hold it to walk.',
      'Tip: the scroll at the top right is your quest journal. Finish every quest for a little surprise!',
      "Tip: every desk in the Work tower is one of Timo's jobs. Walk up to one and press Enter.",
      "Tip: the bookcases at the Academy hold Timo's courses and certificates.",
      'Tip: pet Pip as often as you like. Pip never gets tired of it. Beep.',
      'Tip: in a hurry? Story mode, the book at the top right, unlocks everything so you can just read.',
      'Tip: the post box by the Post office door sends Timo a real message. He reads every letter.',
      'Tip: leave a building over the door mat at the bottom, or press Escape.',
      'Tip: switch on quick travel at the top right for a travel bar at the bottom, and the number keys 1 to 5 take you anywhere.',
      "Tip: Timo's story is on the desk in his house, and the brands he built for are on the trophy shelf.",
      'Fun fact: Timo builds websites that work for everyone, with a keyboard or a screen reader too. So does this town! Beep boop.'
    ],
    next: 'Next',
    close: 'Close',
    backToTown: 'Back to town',
    pad: {
      up: 'Walk up',
      down: 'Walk down',
      left: 'Walk left',
      right: 'Walk right',
      a: 'A: talk or open'
    },
    roomHint: {
      about: 'Make yourself at home. My story is on the desk, the brands I built for are in the display cabinet.',
      experience: 'Every desk in this tower is a job. Walk up to one and press Enter to read about it.',
      education: 'Every bookcase holds a topic. Walk up to one and press Enter to start reading.',
      contact: 'Ask the clerk at the post desk to send me a letter, and I will write back.'
    },
    employers: 'Employers',
    projects: 'Projects',
    collabs: 'Brands and collaborations',
    story: 'My story',
    // Pip speaks for itself (the speaker label already says PIP): cat sounds, with what it does in brackets.
    pip: {
      meet: ['Mrrrp? (stretches, yawns and blinks at you)', '(sniffs your hand) Prrrr... You smell like a friend. Where you go, I go.'],
      pets: [
        'Prrrrrrrr. (headbutts your leg)',
        'Mrrp! (flops over and shows a fluffy belly. It is a trap.)',
        '(slow blink) That means I love you, in cat.',
        '(kneads your shoe) Very soft. Five stars.',
        'Mew! (has spotted a firefly and is very, very serious about it)',
        '(sits on your feet, so you cannot leave) Prrr.',
        'Mrrow? (asks for a snack. You have none. Deep disappointment.)',
        '(tail straight up, ginger flecks glowing in the lamplight) Prrrp!',
        '(sneezes) ...That did not happen.',
        '(rolls in the grass) Siberians like company. You are stuck with me.'
      ]
    },
    companion: 'Companion',
    companionValue: 'Pip, Siberian cat',
    shortcuts: 'Quick travel with number keys 1 to 5',
    quickTravel: 'Quick travel',
    quickTravelHint: 'Shows a travel bar at the bottom, and the number keys 1 to 5 jump straight to any place in town.',
    present: 'present',
    leave: 'Leave',
    previous: 'Previous',
    nextItem: 'Next',
    write: 'Write a letter',
    photo: 'Player card',
    cardPhotoAlt: "Timo Smit in motorcycle gear, smiling and holding a yellow 'Geslaagd' (passed) sign next to motorbikes",
    quests: {
      journal: 'Quest journal',
      tracker: 'Quests here',
      list: {
        byte: 'Say hi to Byte',
        pip: 'Make friends with Pip',
        signs: 'Read every signpost',
        story: "Read Timo's story",
        brands: 'Browse the brand collection',
        desks: 'Visit every desk in the Work tower',
        books: 'Study every bookcase at the Academy',
        letter: 'Post a letter at the Post office'
      },
      unknown: '???',
      updated: 'Quest updated',
      complete: 'Quest complete',
      allDone: 'All quests complete!',
      progress: (done: number, total: number) => `${done} of ${total} quests done`,
      journalHint: (done: number, total: number) => `Your quests and everything you found so far. ${done} of ${total} done.`,
      reread: 'Read again',
      found: 'Found',
      rewardTitle: 'You know Timo now!',
      reward: [
        'Beep boop! You finished every quest in town.',
        'You have seen every job, every topic and every brand. That makes you an expert on Timo Smit.',
        'If you liked what you saw, the Post office is right around the corner. Timo reads every letter.'
      ],
      /** The last reward line when you finish your quests inside the Post office. */
      rewardHere:
        "If you liked what you saw, you're in the right place: the clerk at the post desk will send your letter. Timo reads every letter.",
      storyMode: 'Story mode',
      storyModeHint: 'Story mode unlocks everything, so you can read it all without playing.',
      storyModeTip: 'Unlocks every quest, so you can read it all without playing.',
      skipGame: 'Skip the game: turn on story mode',
      intro: 'Finish the quests to get to know me. No time to play? Turn on story mode at the top right.'
    },
    player: 'Player',
    role: 'Class',
    location: 'Base',
    locationValue: 'Utrecht, NL',
    notFound: "You can't go that way!",
    entering: 'You are now in'
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
    description: 'UBO Agency, Hello World Cards, Capgemini, Accent Interactive, and SmartHOTEL.',
    employers: 'Employers'
  },
  education: {
    title: 'Education',
    description: 'Accessibility, React / Next.js, Artificial Intelligence, Communication and Multimedia Design, and consultancy.',
    topics: 'Topics',
    accessibilityImageAlt: 'A presentation on the Web Content Accessibility Guidelines in a meeting room at Capgemini'
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
    requiredNote: 'Fields marked with * are required.',
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
    homeTitle: 'Timo Smit | Front-end Developer, Accessibility & React',
    homeDescription:
      'Timo Smit is a front-end developer in the Netherlands, focused on web accessibility (WCAG), React, Next.js and Remix.',
    aboutTitle: 'About',
    aboutDescription:
      'About Timo Smit: a creative front-end developer from Utrecht with user experience and accessibility at the core, and the brands he has built for.',
    experienceTitle: 'Experience',
    experienceDescription:
      'Front-end work at UBO Agency, Capgemini, Accent Interactive and SmartHOTEL, for Casio, Fairbanks, the Tweede Kamer and the World Food Programme.',
    educationTitle: 'Education',
    educationDescription:
      'How Timo Smit learned accessibility, React and Next.js, AI-assisted development and consultancy, starting with Communication and Multimedia Design.',
    contactTitle: 'Contact',
    contactDescription:
      'Get in touch with Timo Smit about front-end development, web accessibility or a new project. Send a message or connect on LinkedIn.',
    notFoundTitle: 'Page not found',
    notFoundDescription: 'This page does not exist or has been moved.',
    jobTitle: 'Front-end Developer',
    ogImageAlt: 'Timo Smit, front-end developer: accessibility, React and Remix'
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
    about: 'Over mij',
    experience: 'Ervaring',
    education: 'Opleiding',
    contact: 'Contact',
    getInTouch: 'Neem contact op',
    menu: 'Menu',
    primary: 'Hoofdmenu',
    siteNavigation: 'Sitenavigatie',
    open: 'Menu openen',
    close: 'Menu sluiten',
    breadcrumb: 'Kruimelpad'
  },
  footer: {
    menu: 'Menu',
    follow: 'Volg me',
    linkedInNewTab: ' (opent in een nieuw tabblad)'
  },
  hero: {
    kicker: 'Front-end developer',
    srTitle: 'Timo Smit is een creatieve front-end developer',
    beforeTrait: 'Timo Smit is een ',
    afterTrait: 'front-end developer!'
  },
  motion: {
    pause: 'Animaties pauzeren',
    play: 'Animaties afspelen',
    pauseHint: 'Zet het water, de vuurvliegjes, Byte en alles wat beweegt stil.',
    playHint: 'Laat het water, de vuurvliegjes en Byte weer bewegen.'
  },
  logos: {
    label: 'Projecten en samenwerkingen.'
  },
  scroll: 'Scroll om te ontdekken',
  game: {
    start: 'Begin met ontdekken',
    welcome: 'Welkom in mijn dorp',
    intro:
      'Elk gebouw vertelt een deel van mijn verhaal. Loop rond om te ontdekken, of zet bovenin snel reizen aan om direct naar een plek te gaan.',
    mapLabel: 'Dorpskaart',
    controlsHint: 'Pijltjestoetsen of WASD om te lopen, Enter om iets te doen. Je kunt ook op de kaart klikken.',
    touchHint: 'Tik op de kaart om te lopen, tik op een gebouw of personage om iets te doen.',
    roomControls: 'Pijltjestoetsen of WASD om te lopen, Enter om te gebruiken wat voor je staat. De mat bij de deur gaat naar buiten.',
    roomControlsTouch: 'Tik op de vloer om te lopen, tik op iets om het te gebruiken. De mat bij de deur gaat naar buiten.',
    keys: { move: 'Lopen', interact: 'Gebruiken', travel: 'Reizen', back: 'Verlaten' },
    places: {
      town: 'Dorpsplein',
      about: 'Huis van Timo',
      experience: 'Werktoren',
      education: 'Academie',
      contact: 'Postkantoor'
    },
    placesNav: 'Plekken',
    prompt: {
      enter: 'Naar binnen',
      read: 'Lees het bord',
      talk: 'Praat met Byte',
      pet: 'Aai Pip',
      water: 'Bekijk het water'
    },
    pond: {
      ask: ['De vijver glinstert in het maanlicht. Ergens kwaakt een kikker.', 'Wil je het water op?'],
      yes: 'Ja, varen maar!',
      no: 'Nu even niet',
      aboard: [
        'Piep piep! Bootmodus: aan. Alle hens aan dek, kapitein!',
        'Stuur met de pijltjestoetsen, of tik op het water. Vaar tegen de kant om eraf te springen.'
      ]
    },
    signs: {
      about: 'Huis van Timo. Wie hij is, hoe hij werkt en voor welke merken hij bouwde.',
      experience: 'Werktoren. Elke baan en elk project, verdieping voor verdieping.',
      education: 'Academie. Cursussen, certificaten en wat hij in de praktijk leerde.',
      contact: 'Postkantoor. Stuur Timo een berichtje, hij leest elke brief.'
    },
    robot: [
      'Piep piep! Ik ben Byte, de gids van dit dorp.',
      'Timo Smit woont en werkt hier. Elk gebouw vertelt een deel van zijn verhaal.',
      'Loop een deur in om naar binnen te gaan. Wil je sneller? Zet bovenin snel reizen aan voor een reisbalk onderin en de cijfertoetsen 1 tot 5.',
      'O, en Pip, de kat van Timo, doet een dutje in de tuin naast zijn huis. Zeg even hoi!'
    ],
    robotTips: [
      'Tip: tik op een pijltjestoets (of W, A, S, D) om op de plek te draaien. Houd hem ingedrukt om te lopen.',
      'Tip: de rol rechtsboven is je questlogboek. Rond elke quest af voor een kleine verrassing!',
      'Tip: elk bureau in de Werktoren is een baan van Timo. Loop ernaartoe en druk op Enter.',
      'Tip: in de boekenkasten van de Academie staan de cursussen en certificaten van Timo.',
      'Tip: aai Pip zo vaak als je wilt. Daar krijgt Pip nooit genoeg van. Piep.',
      'Tip: haast? Verhaalmodus, het boek rechtsboven, ontgrendelt alles zodat je gewoon kunt lezen.',
      'Tip: de brievenbus naast de deur van het Postkantoor stuurt Timo een echt bericht. Hij leest elke brief.',
      'Tip: verlaat een gebouw via de deurmat onderaan, of druk op Escape.',
      'Tip: zet rechtsboven snel reizen aan voor een reisbalk onderin, en de cijfertoetsen 1 tot 5 brengen je overal heen.',
      'Tip: het verhaal van Timo ligt op het bureau in zijn huis, en de merken waarvoor hij bouwde staan op de prijzenkast.',
      'Weetje: Timo bouwt websites die voor iedereen werken, ook met een toetsenbord of schermlezer. Dit dorp ook! Piep piep.'
    ],
    next: 'Volgende',
    close: 'Sluiten',
    backToTown: 'Terug naar het dorp',
    pad: {
      up: 'Naar boven lopen',
      down: 'Naar beneden lopen',
      left: 'Naar links lopen',
      right: 'Naar rechts lopen',
      a: 'A: praten of openen'
    },
    roomHint: {
      about: 'Voel je thuis. Mijn verhaal ligt op het bureau, de merken waarvoor ik bouwde staan in de vitrinekast.',
      experience: 'Elk bureau in deze toren is een baan. Loop erheen en druk op Enter om erover te lezen.',
      education: 'Elke boekenkast bevat een onderwerp. Loop erheen en druk op Enter om te gaan lezen.',
      contact: 'Vraag de medewerker aan de balie om mij een brief te sturen, dan schrijf ik terug.'
    },
    employers: 'Werkgevers',
    projects: 'Projecten',
    collabs: 'Merken en samenwerkingen',
    story: 'Mijn verhaal',
    pip: {
      meet: [
        'Mrrrp? (rekt zich uit, gaapt en knippert naar je)',
        '(snuffelt aan je hand) Prrrr... Jij ruikt als een vriend. Waar jij gaat, ga ik.'
      ],
      pets: [
        'Prrrrrrrr. (kopt tegen je been)',
        'Mrrp! (ploft om en laat een pluizige buik zien. Het is een val.)',
        '(knippert langzaam) Dat betekent ik hou van je, in kattentaal.',
        '(kneedt je schoen) Heel zacht. Vijf sterren.',
        'Miauw! (heeft een vuurvliegje gezien en is heel, heel serieus)',
        '(gaat op je voeten zitten, zodat je niet weg kunt) Prrr.',
        'Mrrauw? (vraagt om een snoepje. Je hebt er geen. Diepe teleurstelling.)',
        '(staart recht omhoog, gemberkleurige vlekjes in het lamplicht) Prrrp!',
        '(niest) ...Dat is niet gebeurd.',
        '(rolt door het gras) Siberische katten houden van gezelschap. Je zit aan mij vast.'
      ]
    },
    companion: 'Maatje',
    companionValue: 'Pip, Siberische kat',
    shortcuts: 'Snel reizen met cijfertoetsen 1 tot 5',
    quickTravel: 'Snel reizen',
    quickTravelHint: 'Toont een reisbalk onderin, en de cijfertoetsen 1 tot 5 brengen je direct naar elke plek in het dorp.',
    present: 'heden',
    leave: 'Vertrekken',
    previous: 'Vorige',
    nextItem: 'Volgende',
    write: 'Schrijf een brief',
    photo: 'Spelerskaart',
    cardPhotoAlt: "Timo Smit in motorkleding, lachend met een geel bord 'Geslaagd' naast motoren",
    quests: {
      journal: 'Questlog',
      tracker: 'Quests hier',
      list: {
        byte: 'Zeg hoi tegen Byte',
        pip: 'Word vrienden met Pip',
        signs: 'Lees elk wegwijzerbord',
        story: 'Lees het verhaal van Timo',
        brands: 'Bekijk de merkencollectie',
        desks: 'Bezoek elk bureau in de Werktoren',
        books: 'Bestudeer elke boekenkast in de Academie',
        letter: 'Post een brief bij het Postkantoor'
      },
      unknown: '???',
      updated: 'Quest bijgewerkt',
      complete: 'Quest voltooid',
      allDone: 'Alle quests voltooid!',
      progress: (done: number, total: number) => `${done} van ${total} quests klaar`,
      journalHint: (done: number, total: number) => `Je quests en alles wat je tot nu toe hebt gevonden. ${done} van ${total} klaar.`,
      reread: 'Opnieuw lezen',
      found: 'Gevonden',
      rewardTitle: 'Nu ken je Timo!',
      reward: [
        'Piep piep! Je hebt elke quest in het dorp voltooid.',
        'Je hebt elke baan, elk onderwerp en elk merk gezien. Daarmee ben je expert in Timo Smit.',
        'Vond je het leuk? Het Postkantoor is om de hoek. Timo leest elke brief.'
      ],
      rewardHere:
        'Vond je het leuk? Dan ben je hier op de goede plek: de medewerker aan de balie verstuurt je brief. Timo leest elke brief.',
      storyMode: 'Verhaalmodus',
      storyModeHint: 'Verhaalmodus ontgrendelt alles, zodat je alles kunt lezen zonder te spelen.',
      storyModeTip: 'Ontgrendelt elke quest, zodat je alles kunt lezen zonder te spelen.',
      skipGame: 'Sla het spel over: zet verhaalmodus aan',
      intro: 'Voltooi de quests om mij te leren kennen. Geen tijd om te spelen? Zet rechtsboven de verhaalmodus aan.'
    },
    player: 'Speler',
    role: 'Klasse',
    location: 'Basis',
    locationValue: 'Utrecht, NL',
    notFound: 'Daar kun je niet heen!',
    entering: 'Je bent nu in'
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
    description: 'UBO Agency, Hello World Cards, Capgemini, Accent Interactive en SmartHOTEL.',
    employers: 'Werkgevers'
  },
  education: {
    title: 'Opleiding',
    description: 'Toegankelijkheid, React / Next.js, kunstmatige intelligentie, Communication and Multimedia Design en consultancy.',
    topics: 'Onderwerpen',
    accessibilityImageAlt: 'Een presentatie over de Web Content Accessibility Guidelines in een vergaderruimte bij Capgemini'
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
    requiredNote: 'Velden met * zijn verplicht.',
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
    homeTitle: 'Timo Smit | Front-end developer, toegankelijkheid & React',
    homeDescription:
      'Timo Smit is front-end developer in Nederland, met focus op digitale toegankelijkheid (WCAG), React, Next.js en Remix.',
    aboutTitle: 'Over mij',
    aboutDescription:
      'Over Timo Smit: een creatieve front-end developer uit Utrecht met user experience en toegankelijkheid als kern, en de merken waarvoor hij bouwde.',
    experienceTitle: 'Ervaring',
    experienceDescription:
      'Front-endwerk bij UBO Agency, Capgemini, Accent Interactive en SmartHOTEL, voor onder meer Casio, Fairbanks, de Tweede Kamer en het World Food Programme.',
    educationTitle: 'Opleiding',
    educationDescription:
      'Hoe Timo Smit toegankelijkheid, React en Next.js, werken met AI en consultancy leerde, te beginnen bij Communication and Multimedia Design.',
    contactTitle: 'Contact',
    contactDescription:
      'Neem contact op met Timo Smit over front-end development, digitale toegankelijkheid of een nieuw project. Stuur een bericht of verbind via LinkedIn.',
    notFoundTitle: 'Pagina niet gevonden',
    notFoundDescription: 'Deze pagina bestaat niet of is verplaatst.',
    jobTitle: 'Front-end developer',
    ogImageAlt: 'Timo Smit, front-end developer: toegankelijkheid, React en Remix'
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
