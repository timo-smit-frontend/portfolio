/**
 * Original pixel art, drawn as strings: one character per pixel, `.` is transparent.
 * Every sprite here was made for this site.
 */

export type Palette = Record<string, string>
export type SpriteRows = readonly string[]
export type Direction = 'down' | 'up' | 'left' | 'right'

export const HERO_PALETTE: Palette = {
  K: '#1f2433', // ink: jeans and sneakers keep the dark outline
  O: '#24150e', // hair outline (selective outlines: each part is outlined in a dark tone of itself)
  o: '#6e3c2e', // skin outline
  k: '#3b3646', // tee outline
  H: '#553421', // hair: tousled dark brown, full on top
  h: '#7d5431', // lighter strands, lit from the top left
  l: '#9c7040', // the brightest tips
  d: '#372015', // hair shadow, down the right, and the short sides
  f: '#7c5848', // the cropped back and sides fading into the neck
  S: '#f3c4a6', // fair skin
  s: '#dc9a84', // skin shade, ears: hue-shifted toward rose
  r: '#ee9f90', // flushed cheeks
  E: '#2f3f5c', // eyes: blue-grey
  b: '#7a4e32', // eyebrows: straight, a shade lighter than the hair
  n: '#b87462', // closed eyelids, mid-blink
  m: '#cc8a78', // mouth: closed, a slight smile
  t: '#cfa089', // light stubble along the jaw
  T: '#9794a0', // heather grey crew-neck tee
  u: '#6f6a80', // tee shade and the collar: cooler, toward violet
  Y: '#e0a93a', // mustard chest print
  P: '#3a4a72', // jeans
  p: '#272c50', // jeans shade
  D: '#2a2b3c', // sneakers
  g: '#4a4e60', // sneaker toe caps
  B: '#f8f8f0' // soles
}

// 12 x 20, drawn after Timo himself: tall (190 cm) and slim, so the head is narrow (the face is six pixels wide
// between the ears), the shoulders stay inside the hair and the legs are long. The hair is the likeness: a
// tousled mass, fuller on top than the head is wide, with an uneven top edge, a loose tuft out to the right and
// a strand falling over the forehead. Straight brows over blue-grey eyes and stubble along the jaw keep him
// a grown man rather than a kid. Light comes from the top left: bright tips on the hair, and the hair, tee
// and jeans darken on the right. Each top is head, torso and hips (15 rows); the legs swap per walk frame.
const FRONT_TOP = [
  '....OOO.O...',
  '..OOhlhOhOO.',
  '.OhlhHhhHhdO',
  '.OHhHHhHHHdO',
  '.OHShHhSSHdO',
  '.OdSbSSbSdO.',
  '.osSESSESso.',
  '..orSSSSro..',
  '..otSmmSto..',
  '...otSSto...',
  '...kTuuTk...',
  '.kTTTTTTTuk.',
  '.kTuTTTTuuk.',
  '.oSuTYYTuso.',
  '.oSKPPPpKSo.'
]

// From behind: the same tousled top, mirrored, over the cropped back and sides, which fade into the nape.
const BACK_TOP = [
  '...O.OOO....',
  '.OOhOhhlOO..',
  'OhlhHhhHhdO.',
  '.OhHHhHHHdO.',
  '.OHHhHdHHdO.',
  '.OdHdHHdHdO.',
  '.osddHdddso.',
  '..ofddddfo..',
  '...ofddfo...',
  '....osso....',
  '...kTTTTk...',
  '.kTTTTTTTuk.',
  '.kTuTTTTuuk.',
  '.oSuTTTTuso.',
  '.oSKPPPpKSo.'
]

// Facing left: the fringe pushes forward over the forehead, a pixel past the face, and from there the hair
// rises back in a slope to its highest point over the crown (forward, not a wall standing up at the front). It
// does not bulge out behind: the back and sides are cropped short and dark, fading into the neck, ear in the clear. Stubble under the jaw, the chin back under the mouth.
const SIDE_HEAD = [
  '.....OO.O...',
  '..OOOhhOhO..',
  '.OlhhHhHhhO.',
  'OhhHHhHHHdO.',
  'OHhSSHHHddO.',
  '.oSbSSdddfO.',
  'oSSESSsdfO..',
  '.oSSrSSsfo..',
  '.omSStsso...',
  '..ottsso....',
  '...kTssTk...',
  '...kTTTuk...'
]

// The near arm: a short sleeve at the shoulder and the hand at the hip.
const SIDE_TOP = [...SIDE_HEAD, '...kTuTuk...', '...kTuSuk...', '...KPPSpK...']

// Legs: each one lit on its left and shaded on its right, so two read side by side without a gap.
const LEGS_STAND = ['...KPpPpK...', '...KPpPpK...', '...KPpPpK...', '..KgDKKgDK..', '..KBBKKBBK..']
const BACK_LEGS_STAND = ['...KPpPpK...', '...KPpPpK...', '...KPpPpK...', '..KDDKKDDK..', '..KBBKKBBK..']
const SIDE_LEGS_STAND = ['...KPPpK....', '...KPPpK....', '...KPPpK....', '..KgDDDK....', '..KBBBBK....']

/*
 * The walk: four poses per direction, two tiles to a cycle. A stride (`contact`: one leg out in front, the
 * other behind, the body a pixel lower because the legs are spread, so those frames start with an empty row),
 * then `passing` (the front leg now carries him, upright, while the other foot comes off the ground on its way
 * forward), and the same again on the other foot. The arms swing against the legs.
 */
const DIP = '............'
const FRONT_BODY = FRONT_TOP.slice(0, 13)
const BACK_BODY = BACK_TOP.slice(0, 13)

// Facing you, the limb coming towards you is drawn longer: the leading foot is flat on the ground while the
// trailing one is tucked in under its leg with no sole down, and the arm swinging forward ends a row lower than
// the one swinging back. Passing, the lifted foot shows no sole on the ground either.
const FRONT_CONTACT_A = ['.oSuTYYTuso.', '..oKPPPpKSo.', '...KPpPpKSo.', '...KPpPpK...', '..KgDKgDK...', '..KBBKKK....']
const FRONT_CONTACT_B = ['.oSuTYYTuso.', '.oSKPPPpKo..', '.oSKPpPpK...', '...KPpPpK...', '...KgDKgDK..', '....KKKBBK..']
const FRONT_PASSING_A = ['.oSuTYYTuso.', '.oSKPPPpKSo.', ...LEGS_STAND.slice(0, 4), '..KBBKKKK...']
const FRONT_PASSING_B = ['.oSuTYYTuso.', '.oSKPPPpKSo.', ...LEGS_STAND.slice(0, 4), '...KKKKBBK..']

// Walking away it is the trailing leg and arm that are nearest, so those are the long ones, and the foot that
// lifts shows you its white sole.
const BACK_CONTACT_A = ['.oSuTTTTuso.', '..oKPPPpKSo.', '...KPpPpKSo.', '...KPpPpK...', '..KDDKDDK...', '..KBBKKK....']
const BACK_CONTACT_B = ['.oSuTTTTuso.', '.oSKPPPpKo..', '.oSKPpPpK...', '...KPpPpK...', '...KDDKDDK..', '....KKKBBK..']
const BACK_PASSING_A = ['.oSuTTTTuso.', '.oSKPPPpKSo.', ...BACK_LEGS_STAND.slice(0, 3), '..KDDKKBBK..', '..KBBKKKK...']
const BACK_PASSING_B = ['.oSuTTTTuso.', '.oSKPPPpKSo.', ...BACK_LEGS_STAND.slice(0, 3), '..KBBKKDDK..', '...KKKKBBK..']

// Side on: the near leg is lit, the far leg in shade. Stride A puts the near leg in front with the near arm
// back (and the far hand showing ahead of the chest); stride B is the other way round. Passing, the trailing
// foot is lifted behind the standing leg.
const SIDE_CONTACT_A = ['...kTTuTk...', '..osTTTSo...', '...KPPPpSo..', '...KPPPpK...', '..KPPKKppK..', '.KgDDK.KDDK.', '.KBBBK.KBBK.']
const SIDE_CONTACT_B = ['...kuTTuk...', '..oSsTTuso..', '..oSPPPpK...', '...KpPPPK...', '..KppKKPPK..', '.KDDDK.KgDK.', '.KBBBK.KBBK.']
const SIDE_PASSING_A = [...SIDE_TOP.slice(12), '...KPPpK....', '...KPPpK....', '...KPPKpK...', '..KgDDKDDK..', '..KBBBKKK...']
const SIDE_PASSING_B = [...SIDE_TOP.slice(12), '...KPPpK....', '...KpPPK....', '...KpKPPK...', '..KDDKKgDK..', '..KBBK.KK...']

/** [stand, stride A, passing A, stride B, passing B] per direction; `right` is `left` mirrored at draw time. */
export const HERO_FRAMES: Record<Exclude<Direction, 'right'>, SpriteRows[]> = {
  down: [
    [...FRONT_TOP, ...LEGS_STAND],
    [DIP, ...FRONT_BODY, ...FRONT_CONTACT_A],
    [...FRONT_BODY, ...FRONT_PASSING_A],
    [DIP, ...FRONT_BODY, ...FRONT_CONTACT_B],
    [...FRONT_BODY, ...FRONT_PASSING_B]
  ],
  up: [
    [...BACK_TOP, ...BACK_LEGS_STAND],
    [DIP, ...BACK_BODY, ...BACK_CONTACT_A],
    [...BACK_BODY, ...BACK_PASSING_A],
    [DIP, ...BACK_BODY, ...BACK_CONTACT_B],
    [...BACK_BODY, ...BACK_PASSING_B]
  ],
  left: [
    [...SIDE_TOP, ...SIDE_LEGS_STAND],
    [DIP, ...SIDE_HEAD, ...SIDE_CONTACT_A],
    [...SIDE_HEAD, ...SIDE_PASSING_A],
    [DIP, ...SIDE_HEAD, ...SIDE_CONTACT_B],
    [...SIDE_HEAD, ...SIDE_PASSING_B]
  ]
}

/**
 * Which of HERO_FRAMES to draw. `t` runs from 0 to 1 over one tile and `steps` counts the tiles walked: the
 * first half of a tile is a stride, the second half the passing pose after it, alternating feet per tile.
 */
export function heroFrame(walking: boolean, steps: number, t: number): number {
  if (!walking) return 0
  const stride = steps % 2 ? 1 : 3
  return t < 0.5 ? stride : stride + 1
}

/**
 * Sitting on an office chair. From behind only the top half shows (the back rest hides the rest); facing you
 * the shins hang down short under the lap; side on the thigh lies flat on the seat and the shin hangs down.
 */
export const HERO_SIT: Record<Exclude<Direction, 'right'>, SpriteRows> = {
  down: [...FRONT_TOP, '...KPpPpK...', '...KPpPpK...', '..KgDKKgDK..'],
  up: BACK_TOP,
  left: [...SIDE_TOP.slice(0, 14), '..KKPPSpK...', '.KPPPPPPpK..', '.KPPKKKKK...', '.KPpK.......', 'KgDDK.......']
}

export const HERO_FRONT = HERO_FRAMES.down[0]!

/** Rows the hero is tall: the scenes stand his feet on the tile and put the "!" bubble above his head. */
export const HERO_HEIGHT = HERO_FRONT.length

/** Standing still, facing you, mid-blink. */
export const HERO_BLINK: SpriteRows = [...FRONT_TOP.slice(0, 6), '.osSnSSnSso.', ...FRONT_TOP.slice(7), ...LEGS_STAND]

/** Byte, the little helper robot who greets visitors in town. 12 x 14. */
export const ROBOT_PALETTE: Palette = {
  K: '#1f2433',
  W: '#e8eef8',
  w: '#b8c4d8',
  R: '#d84838',
  B: '#58a8f8',
  G: '#e4b84a'
}

export const ROBOT: SpriteRows = [
  '.....KK.....',
  '.....RK.....',
  '...KKKKKK...',
  '..KWWWWWwK..',
  '..KWBWWBwK..',
  '..KWWWWWwK..',
  '..KWKKKKwK..',
  '...KKKKKK...',
  '.KKWWWWWwKK.',
  '.KwKWGGWKwK.',
  '.KKKWWWwKKK.',
  '...KWwwwK...',
  '...KK..KK...',
  '...KKK.KKK..'
]

/**
 * Byte in boat mode, bow to the left: his head folds forward into the bow (antenna light up front, eyes
 * looking ahead), his body flattens into the hull and the gold chest button stays on the side. 16 x 9.
 */
export const BOAT: SpriteRows = [
  '...KK...........',
  '...RK...........',
  '.KKKKKK.........',
  'KWWWWWwK........',
  'KWBWWBwKKKKKKKKK',
  'KWWWWWWWWWWWWWwK',
  '.KwWWGGWWWWWWwK.',
  '..KwwwwwwwwwwK..',
  '...KKKKKKKKKK...'
]

/** Byte's boat palette: his own colours plus the shadowed inside of the hull. */
export const BOAT_PALETTE: Palette = { ...ROBOT_PALETTE, d: '#4a5a78' }

/**
 * Byte's boat heading down, towards you: seen from above and behind, his face is the bow at the bottom (eyes,
 * chest button, the antenna light on the tip). Rows from BOAT_DOWN_FRONT on are drawn over whoever sits in it.
 * 16 x 16.
 */
export const BOAT_DOWN: SpriteRows = [
  '....KKKKKKKK....',
  '...KwWWWWWWwK...',
  '..KWKKKKKKKKwK..',
  '.KWKddddddddKwK.',
  '.KWKddddddddKwK.',
  '.KWKddddddddKwK.',
  '.KWKddddddddKwK.',
  '.KWKddddddddKwK.',
  '.KWKddddddddKwK.',
  '.KWKKKKKKKKKKwK.',
  'KWWWWWWWWWWWWWwK',
  'KWWWBWWWWWWBWWwK',
  'KWWWWWWWWWWWWWwK',
  '.KwWWWWGGWWWWwK.',
  '..KwwwwRRwwwwK..',
  '...KKKKKKKKKK...'
]
export const BOAT_DOWN_FRONT = 9

/**
 * Heading up, away from you: the back of his head is the bow at the top, the antenna light sticking up past
 * the hero, and a plain stern at the bottom (from BOAT_UP_FRONT on, drawn over the hero). 16 x 19.
 */
export const BOAT_UP: SpriteRows = [
  '.......RK.......',
  '.......KK.......',
  '.....KKKKKK.....',
  '....KWWWWWwK....',
  '...KWWWWWWWwK...',
  '..KWWWWWWWWWwK..',
  '.KWKKKKKKKKKKwK.',
  '.KWKddddddddKwK.',
  '.KWKddddddddKwK.',
  '.KWKddddddddKwK.',
  '.KWKddddddddKwK.',
  '.KWKddddddddKwK.',
  '.KWKddddddddKwK.',
  '.KWKddddddddKwK.',
  '.KWKKKKKKKKKKwK.',
  'KWWWWWWWWWWWWWwK',
  'KwWWWWWWWWWWWWwK',
  '.KwwwwwwwwwwwwK.',
  '..KKKKKKKKKKKK..'
]
export const BOAT_UP_FRONT = 14

/** Byte from the side, facing left (mirrored for right): one eye, the antenna, an arm in front. */
export const ROBOT_SIDE: SpriteRows = [
  '.....KK.....',
  '.....RK.....',
  '...KKKKKK...',
  '..KWWWWwwK..',
  '..KBWWWwwK..',
  '..KWWWWwwK..',
  '..KKKWWwwK..',
  '...KKKKKK...',
  '...KWWWwK...',
  '..KKWWWwK...',
  '..KwKWwwK...',
  '...KWwwwK...',
  '....KK.KK...',
  '...KKK.KK...'
]

/** Byte from behind: no face, a vented back panel. */
export const ROBOT_BACK: SpriteRows = [
  '.....KK.....',
  '.....KR.....',
  '...KKKKKK...',
  '..KWWWWWwK..',
  '..KWWWWWwK..',
  '..KWwwwwwK..',
  '..KWWWWWwK..',
  '...KKKKKK...',
  '.KKWWWWWwKK.',
  '.KwKwKKwKwK.',
  '.KKKWWWwKKK.',
  '...KWwwwK...',
  '...KK..KK...',
  '...KKK.KKK..'
]

/** A signpost. 12 x 12. */
export const SIGN_PALETTE: Palette = { K: '#1f2433', W: '#c88848', w: '#a06830', L: '#f0d8a8' }
export const SIGN: SpriteRows = [
  '............',
  '.KKKKKKKKKK.',
  '.KLLLLLLLLK.',
  '.KLwwLwLwLK.',
  '.KLLLLLLLLK.',
  '.KLwLwwwLLK.',
  '.KKKKKKKKKK.',
  '.....Kw.....',
  '.....Kw.....',
  '.....Kw.....',
  '....KKwK....',
  '............'
]

/** Pixel heart for the footer. 7 x 6. */
export const HEART: SpriteRows = ['.RR.RR.', 'RWRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...']
export const HEART_PALETTE: Palette = { R: '#d84838', W: '#f8f8f0' }

/** Envelope for the post office. 10 x 8. */
export const ENVELOPE: SpriteRows = [
  'KKKKKKKKKK',
  'KWKWWWWKWK',
  'KWWKWWKWWK',
  'KWWWKKWWWK',
  'KWWWWWWWWK',
  'KWWWWWWWWK',
  'KWWWWWWWWK',
  'KKKKKKKKKK'
]
export const ENVELOPE_PALETTE: Palette = { K: '#1f2433', W: '#f8f8f0' }

/** Star / sparkle used for selected items. 5 x 5. */
export const SPARKLE: SpriteRows = ['..G..', '..G..', 'GGWGG', '..G..', '..G..']
export const SPARKLE_PALETTE: Palette = { G: '#e4b84a', W: '#ffffff' }

/* ---------------------------------------------------------------------------
 * Hotbar icons, 16 x 16: ink outline, two-tone shading, warm lit windows.
 * ------------------------------------------------------------------------- */

export const ICON_PALETTE: Palette = {
  K: '#14202a', // outline
  W: '#efe6cf', // wall
  w: '#c9bc98', // wall shade
  G: '#e4b84a', // gold
  g: '#b8862e', // gold shade
  Y: '#ffe9a0', // window light
  y: '#f0c860', // window light shade
  R: '#c0473b', // red
  r: '#8e3027', // red shade
  O: '#d08a3c', // roof
  o: '#a8652a', // roof shade
  N: '#3d64ad', // tower
  n: '#27427a', // tower shade
  F: '#3f8a5e', // academy roof
  f: '#2a6342', // academy roof shade
  D: '#7a4f2a', // door
  S: '#cfc6b4', // stone
  s: '#9a9180', // stone shade
  L: '#e3dccd', // stone light
  A: '#2f78a8', // fountain pool
  a: '#8fcbe6', // falling water
  E: '#d6f2fb', // spray
  P: '#f8f8f0' // paper
}

/** The plaza fountain as it stands in town: octagonal basin, column, wide upper bowl, small top bowl and jet. */
export const ICON_TOWN: SpriteRows = [
  '.......EE.......',
  '.....E.aa.E.....',
  '.....KKKKKK.....',
  '....aKAAAAKa....',
  '....aKssssKa....',
  '....a.KSsK.a....',
  '..aKKKKKKKKKKa..',
  '..aKLAAAAAALKa..',
  '..a.KssssssK.a..',
  '..a...KSsK...a..',
  '.KKKKKKSsKKKKKK.',
  'KSEAAAASsAAAAESK',
  'KSAaAAAssAAAaASK',
  'KLSSSSSSSSSSSSLK',
  '.KssssssssssssK.',
  '..KKKKKKKKKKKK..'
]

export const ICON_HOUSE: SpriteRows = [
  '...........KKK..',
  '.......KK..KrK..',
  '......KOOK.KrK..',
  '.....KOOOOKKrK..',
  '....KOOOOOOKKK..',
  '...KOOOOOOOOK...',
  '..KOoOOOOOOoOK..',
  '.KOOOOOOOOOOOOK.',
  'KKKKKKKKKKKKKKKK',
  '.KWWWWWWWWWWWWK.',
  '.KWKKKKWWKKKKWK.',
  '.KWKYYKWWKDDKWK.',
  '.KWKYyKWWKDDKWK.',
  '.KWKKKKWWKDGKwK.',
  '.KwwwwwwwKDDKwK.',
  'KKKKKKKKKKKKKKKK'
]

export const ICON_TOWER: SpriteRows = [
  '.......K........',
  '......KRK.......',
  '.......K........',
  '....KKKKKKKK....',
  '....KnnnnnnK....',
  '...KKKKKKKKKK...',
  '...KNYNNYNNnK...',
  '...KNYNNYNNnK...',
  '...KNNNNNNNnK...',
  '...KNYNNYNNnK...',
  '...KNYNNYNNnK...',
  '...KNNNNNNNnK...',
  '...KNNKKKNNnK...',
  '...KNNKDKNNnK...',
  '...KNNKDKNNnK...',
  '..KKKKKKKKKKKK..'
]

export const ICON_ACADEMY: SpriteRows = [
  '.......KK.......',
  '......KGGK......',
  '......KggK......',
  '.....KKKKKK.....',
  '....KFFFFFFK....',
  '...KFFFFFFFFK...',
  '..KFFFFFFFFFFK..',
  '.KffffffffffffK.',
  'KKKKKKKKKKKKKKKK',
  '.KWKWWKWWKWWKWK.',
  '.KWKWWKWWKWWKWK.',
  '.KWKWWKDDKWWKWK.',
  '.KWKWWKDDKWWKWK.',
  '.KwKwwKDDKwwKwK.',
  'KSSSSSSSSSSSSSSK',
  'KKKKKKKKKKKKKKKK'
]

export const ICON_POST: SpriteRows = [
  '................',
  '................',
  '.KKKKKKKKKKKKKK.',
  '.KPKPPPPPPPPKPK.',
  '.KPPKPPPPPPKPPK.',
  '.KPPPKPPPPKPPPK.',
  '.KPPPPKRRKPPPPK.',
  '.KPPPPKRrKPPPPK.',
  '.KPPPKwRRwKPPPK.',
  '.KPPKwwwwwwKPPK.',
  '.KPKwwwwwwwwKPK.',
  '.KKwwwwwwwwwwKK.',
  '.KKKKKKKKKKKKKK.',
  '................',
  '................',
  '................'
]

/** The Post office clerk, seen from the waist up (the counter hides the rest). 12 x 16: a navy cap with a red band. */
export const CLERK_PALETTE: Palette = {
  K: '#1f2433', // outline
  C: '#2c3f6e', // cap
  c: '#1d2b4f', // visor
  R: '#c0473b', // red band and tie
  G: '#e4b84a', // brass badge and buttons
  H: '#b8b2a8', // grey sideburns
  S: '#c98d6b', // skin
  s: '#a8704f', // skin shade, ears
  r: '#d88a78', // cheeks
  E: '#263040', // eyes
  m: '#8a4a44', // smile
  U: '#4f6fb3', // uniform, the counter's blue
  u: '#3b5590', // uniform shade
  W: '#f4efe0' // collar
}
const CLERK_TOP = ['...KKKKKK...', '..KCCCCCCK..', '.KCCCGGCCCK.', '.KRRRRRRRRK.', 'KKccccccccKK', '.KHSSSSSSHK.']
const CLERK_BODY = [
  '.KrSSSSSSrK.',
  '..KSmSSmSK..',
  '..KKSmmSKK..',
  '.KUUKWWKUUK.',
  'KUUUWRRWUUUK',
  'KUuUURRUUuUK',
  'KUuUGUUGUuUK',
  'KUKuUUUUuKUK'
]
export const CLERK: SpriteRows = [...CLERK_TOP, '.KSSESSESSK.', 'KsSSESSESSsK', ...CLERK_BODY]
export const CLERK_BLINK: SpriteRows = [...CLERK_TOP, '.KSSSSSSSSK.', 'KsSSKSSKSSsK', ...CLERK_BODY]

/** A "..." speech bubble over someone you can talk to. 9 x 7. */
export const TALK: SpriteRows = ['.KKKKKKK.', 'KWWWWWWWK', 'KWKWKWKWK', 'KWWWWWWWK', '.KKKKWKK.', '.....KK..', '......K..']

/** Little "!" speech bubble over the player's head when something can be used. 9 x 9. */
export const BUBBLE: SpriteRows = [
  '.KKKKKKK.',
  'KWWWKWWWK',
  'KWWWKWWWK',
  'KWWWKWWWK',
  'KWWWWWWWK',
  'KWWWKWWWK',
  '.KKKKKKK.',
  '..KWK....',
  '..KK.....'
]
export const BUBBLE_PALETTE: Palette = { K: '#14202a', W: '#f8f8f0' }

/* ---------------------------------------------------------------------------
 * Pip, Timo's Siberian cat: grey-brown tabby with ginger flecks, a cream ruff and green eyes.
 * ------------------------------------------------------------------------- */

export const PIP_PALETTE: Palette = {
  K: '#2a221c',
  b: '#8b7462',
  d: '#56463a',
  o: '#b98257',
  c: '#d2b88a', // ruff and chest: warm light brown, not white
  G: '#a9c46c',
  k: '#1c1612',
  P: '#d98a7c',
  p: '#c98f7f',
  w: '#e6d3ad'
}

/** Sitting, facing you: big green eyes, cream ruff and paws, the fluffy tail curled round to the right. 14 x 14. */
export const PIP_SIT: SpriteRows = [
  '..K......K....',
  '.KoK....KdK...',
  '.KpbKKKKbpK...',
  '.KbdbddbdoK...',
  '.KbGkbbkGbK...',
  '.KbGkbbkGbK...',
  '.KbbcPPcbbK...',
  '.KbcdccdcbK...',
  '..KccccccK....',
  '.KbccccccbK...',
  'KbdbccccbdbKK.',
  'KbbKcwKwcKbKdK',
  '.KKKKKKKKKKbbK',
  '..........KKK.'
]

export const PIP_BLINK: SpriteRows = [...PIP_SIT.slice(0, 4), '.KbbbbbbbbK...', '.KbkkbbkkbK...', ...PIP_SIT.slice(6)]

/** Walking, facing left (mirrored for right). 16 x 11. */
export const PIP_WALK: SpriteRows[] = [
  [
    '..K.K...........',
    '.KoKdK......KK..',
    'KbopbbK....KbdK.',
    'KbbdbbbK...KdbK.',
    'KGkbbbbK..KbbK..',
    'KPccbbbKKKKbdK..',
    '.KcccbdbbdbbbK..',
    '..KccbbbbbobbK..',
    '..KcbbbobbbbdK..',
    '..KbK.KbK.KbbK..',
    '..KK..KK...KK...'
  ],
  [
    '..K.K...........',
    '.KoKdK.......K..',
    'KbopbbK.....KbK.',
    'KbbdbbbK...KdbK.',
    'KGkbbbbK...KbK..',
    'KPccbbbKKKKbdK..',
    '.KcccbdbbdbbbK..',
    '..KccbbbbbobbK..',
    '..KcbbbobbbbdK..',
    '...KbKKbK.KbK...',
    '...KK.KK..KK....'
  ]
]

// Front and back walk cycles share the leg rows: one paw a pixel lower than the other, swapping each step.
const PIP_FRONT_LEGS: SpriteRows[] = [
  ['..KbbKKwwK..', '..KwwKKKKK..', '..KKKK......'],
  ['..KwwKKbbK..', '..KKKKKwwK..', '......KKKK..']
]
const PIP_BACK_LEGS: SpriteRows[] = [
  ['..KbbKKddK...', '..KddKKKKK...', '..KKKK.......'],
  ['..KddKKbbK...', '..KKKKKddK...', '......KKKK...']
]

/** Walking towards you: the sitting face over a short body, paws stepping. 12 x 14, drawn where PIP_SIT is. */
const PIP_FRONT_TOP: SpriteRows = [
  '..K......K..',
  '.KoK....KdK.',
  '.KpbKKKKbpK.',
  '.KbdbddbdoK.',
  '.KbGkbbkGbK.',
  '.KbGkbbkGbK.',
  '.KbbcPPcbbK.',
  '.KbcdccdcbK.',
  '..KccccccK..',
  '.KbccccccbK.',
  '.KdbccccbdK.'
]
export const PIP_WALK_DOWN: SpriteRows[] = PIP_FRONT_LEGS.map((legs) => [...PIP_FRONT_TOP, ...legs])

/** Walking away from you: striped back of the head and the tail held up. 13 x 14, drawn where PIP_SIT is. */
const PIP_BACK_TOP: SpriteRows = [
  '..K......K...',
  '.KdK....KdK..',
  '.KbbKKKKbbK..',
  '.KbdbddbdbK..',
  '.KbbdbbdbbKK.',
  '.KdbbbbbbdKoK',
  '..KbbbbbbKKbK',
  '.KbdbddbdbKdK',
  '.KbbdbbdbbKbK',
  '.KbbbbbbbbbbK',
  '.KdbbbbbbdKK.'
]
export const PIP_WALK_UP: SpriteRows[] = PIP_BACK_LEGS.map((legs) => [...PIP_BACK_TOP, ...legs])

/** Curled up asleep, tail wrapped around. 16 x 9. */
export const PIP_SLEEP: SpriteRows = [
  '..K.K...........',
  '.KoKdK..KKKKK...',
  '.KpbbbKKbbdbbKK.',
  'KbbdbbbbbbbbbdbK',
  'KkkbbdbbbobbbbbK',
  'KbPbbbbbbbbbdbbK',
  '.KccbKKKKKbbbbK.',
  '..KKKKoddoKdbK..',
  '....KKKKKKKKK...'
]

/** A little heart that floats up when you pet Pip. 7 x 6. */
export const PIP_HEART: SpriteRows = ['.RR.RR.', 'RWRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...']
export const PIP_HEART_PALETTE: Palette = { R: '#f07c8a', W: '#fff1f3' }
