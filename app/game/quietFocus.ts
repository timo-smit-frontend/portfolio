/**
 * Focus the game gives a scene for you (the walking keys, a new scene, closing a dialog, clicking the map)
 * shows no focus ring: the player on screen already shows where you are. Reaching the scene with Tab shows
 * the ring as usual (WCAG 2.4.7), because the marker goes as soon as focus leaves.
 */
function markQuiet(element: HTMLElement) {
  if (element.dataset.quietFocus !== undefined) return
  element.dataset.quietFocus = ''
  element.addEventListener('blur', () => delete element.dataset.quietFocus, { once: true })
}

export function quietFocus(element: HTMLElement | null | undefined) {
  if (!element) return
  markQuiet(element)
  element.focus({ preventScroll: true })
}

/**
 * Clicking or tapping a scene focuses it by pointer; Chrome then shows the ring on the next arrow key. Mark
 * that focus as quiet too. Returns the cleanup for an effect.
 */
export function quietOnPointer(element: HTMLElement) {
  const onDown = () => markQuiet(element)
  element.addEventListener('pointerdown', onDown, true)
  return () => element.removeEventListener('pointerdown', onDown, true)
}
