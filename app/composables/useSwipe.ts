import type { MaybeRefOrGetter } from 'vue'

export type SwipeDirection = 'left' | 'right'

/** Horizontal distance (px) a drag must travel to count as a swipe. */
export const SWIPE_THRESHOLD = 60

/** A drag is a swipe when it is long enough and mostly horizontal (so vertical scrolling still works). */
export function swipeDirection(dx: number, dy: number, threshold = SWIPE_THRESHOLD): SwipeDirection | null {
  if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return null
  return dx < 0 ? 'left' : 'right'
}

export interface SwipeHandlers {
  onLeft?: () => unknown
  onRight?: () => unknown
}

/** Quiet time (ms) that ends a trackpad gesture, including its inertia. */
const WHEEL_IDLE_MS = 200

/**
 * Swipes on an element: dragging with a finger, pen or mouse, or a sideways trackpad scroll.
 * `offset` follows the gesture, so the card can move with it.
 * The element needs `touch-action: pan-y`, or the browser takes horizontal drags for itself.
 */
export function useSwipe(target: MaybeRefOrGetter<HTMLElement | null | undefined>, handlers: SwipeHandlers) {
  const offset = ref(0)
  const dragging = ref(false)
  let start: { id: number, x: number, y: number } | null = null

  function onDown(event: PointerEvent) {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
    start = { id: event.pointerId, x: event.clientX, y: event.clientY }
  }

  function onMove(event: PointerEvent) {
    if (!start || event.pointerId !== start.id) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (!dragging.value && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      dragging.value = true
      // Keep getting moves outside the element, and drop the text a mouse drag started selecting.
      try {
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
      }
      catch {
        // Synthetic or already released pointer.
      }
      window.getSelection()?.removeAllRanges()
    }
    if (dragging.value) offset.value = dx
  }

  function onUp(event: PointerEvent) {
    if (!start || event.pointerId !== start.id) return
    const direction = event.type === 'pointerup'
      ? swipeDirection(event.clientX - start.x, event.clientY - start.y)
      : null
    start = null
    dragging.value = false
    offset.value = 0
    if (!direction) return
    // The finger may lift over a button: the swipe is not a tap on it.
    window.addEventListener('click', swallowClick, { capture: true, once: true })
    setTimeout(() => window.removeEventListener('click', swallowClick, { capture: true }), 0)
    finish(direction)
  }

  function swallowClick(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
  }

  function finish(direction: SwipeDirection | null) {
    if (direction === 'left') handlers.onLeft?.()
    else if (direction === 'right') handlers.onRight?.()
  }

  // Trackpad: one sideways scroll gesture (with its inertia) changes one card at most.
  let wheelX = 0
  let wheelY = 0
  let wheelDone = false
  let wheelTimer: ReturnType<typeof setTimeout> | undefined

  function onWheel(event: WheelEvent) {
    // Pinch zoom, or a vertical scroll that is not part of a sideways gesture: leave it alone.
    if (event.ctrlKey) return
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) && wheelX === 0 && !wheelDone) return
    // Otherwise the browser takes a sideways swipe as "back" (macOS).
    event.preventDefault()
    clearTimeout(wheelTimer)
    wheelTimer = setTimeout(() => {
      wheelX = 0
      wheelY = 0
      wheelDone = false
      dragging.value = false
      offset.value = 0
    }, WHEEL_IDLE_MS)
    if (wheelDone) return
    wheelX += event.deltaX
    wheelY += event.deltaY
    const direction = swipeDirection(-wheelX, -wheelY)
    if (!direction) {
      dragging.value = true
      offset.value = -wheelX
      return
    }
    wheelDone = true
    dragging.value = false
    offset.value = 0
    finish(direction)
  }

  const events = { pointerdown: onDown, pointermove: onMove, pointerup: onUp, pointercancel: onUp, wheel: onWheel } as const
  let bound: HTMLElement | null = null
  function unbind() {
    if (!bound) return
    for (const [name, handler] of Object.entries(events)) bound.removeEventListener(name, handler as EventListener)
    bound = null
  }
  watch(() => toValue(target), (element) => {
    unbind()
    if (!element) return
    // Not passive for `wheel`, which cancels the browser's swipe-to-go-back.
    for (const [name, handler] of Object.entries(events)) element.addEventListener(name, handler as EventListener, { passive: name !== 'wheel' })
    bound = element
  }, { immediate: true, flush: 'post' })
  onBeforeUnmount(() => {
    unbind()
    clearTimeout(wheelTimer)
  })

  return { offset, dragging }
}
