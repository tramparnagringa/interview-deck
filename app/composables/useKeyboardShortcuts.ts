/** Return `false` when the key was not handled, so other listeners (and the browser) still get it. */
type ShortcutHandler = () => unknown

export interface KeyboardShortcutHandlers {
  /** `Space`: start / pause the timer. */
  onToggle?: ShortcutHandler
  /** `→`: next card. */
  onNext?: ShortcutHandler
}

/** True when the key event should be left to the focused element (typing, native controls). */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/** Screen-share friendly shortcuts (PRD screen 07). Ignored while typing or with modifiers. */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  function onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return
    if (isTypingTarget(event.target)) return

    if (event.code === 'Space' && handlers.onToggle) {
      // A focused button, link or disclosure already reacts to Space natively.
      if (event.target instanceof HTMLElement && event.target.closest('button, a, summary, [role="button"]')) return
      if (handlers.onToggle() !== false) event.preventDefault()
    }
    else if (event.key === 'ArrowRight' && handlers.onNext) {
      if (handlers.onNext() !== false) event.preventDefault()
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
