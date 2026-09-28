/**
 * Dark "focus" look for the answering screen (PRD screen 03). A state flag read by the layout,
 * instead of a separate layout: switching layouts would remount the page and lose its state.
 */
export function useFocusMode() {
  const focus = useState('focus-mode', () => false)
  onBeforeUnmount(() => {
    focus.value = false
  })
  return focus
}
