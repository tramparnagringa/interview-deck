<template>
  <div
    ref="root"
    class="relative"
  >
    <UiIconButton
      icon="lucide:menu"
      :label="label"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="open = !open"
    />
    <nav
      v-show="open"
      :id="panelId"
      :aria-label="label"
      class="absolute right-0 top-full z-10 mt-2 flex min-w-56 flex-col rounded-panel border border-border bg-surface p-2 shadow-card"
      @click="onPanelClick"
    >
      <slot />
    </nav>
  </div>
</template>

<script setup lang="ts">
/** Disclosure menu opened by an icon button. Closes on Escape, outside click, item click and navigation. */
defineProps<{ label: string }>()

const open = ref(false)
const root = useTemplateRef<HTMLElement>('root')
const panelId = useId()
const route = useRoute()

watch(() => route.fullPath, () => {
  open.value = false
})

function onPanelClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('a, button')) open.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>
