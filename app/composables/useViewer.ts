import type { Viewer } from '~/utils/access'

interface ViewerState extends Viewer {
  email: string | null
  /** False until the session has been read in the browser (always false while prerendering). */
  ready: boolean
}

/** The signed-in account and whether it is Premium. Filled by plugins/supabase.client.ts. */
export function useViewer() {
  return useState<ViewerState>('viewer', () => ({ signedIn: false, premium: false, email: null, ready: false }))
}
