import type { Level } from '#shared/schemas/deck'

declare module '#app' {
  interface PageMeta {
    /** Access level the page mounts its screen with. Defaults to free. */
    level?: Level
  }
}

export {}
