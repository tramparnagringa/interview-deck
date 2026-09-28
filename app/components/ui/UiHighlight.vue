<template>
  <span>
    <template
      v-for="(part, index) in parts"
      :key="index"
    >
      <mark
        v-if="part.marked"
        class="rounded-sm bg-highlight px-1 font-semibold text-ink"
      >{{ part.text }}</mark>
      <template v-else>
        {{ part.text }}
      </template>
    </template>
  </span>
</template>

<script setup lang="ts">
/** Renders `text`, wrapping every whole-word occurrence of `marks` in a <mark>. */
const props = withDefaults(defineProps<{
  text: string
  marks?: string[]
}>(), {
  marks: () => [],
})

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const parts = computed(() => {
  const terms = props.marks.map(mark => mark.trim()).filter(Boolean)
  if (terms.length === 0) return [{ text: props.text, marked: false }]
  const pattern = new RegExp(`(?<![\\w’'])(${terms.map(escape).join('|')})(?![\\w’'])`, 'gi')
  const result: { text: string, marked: boolean }[] = []
  let last = 0
  for (const match of props.text.matchAll(pattern)) {
    const start = match.index ?? 0
    if (start > last) result.push({ text: props.text.slice(last, start), marked: false })
    result.push({ text: match[0], marked: true })
    last = start + match[0].length
  }
  if (last < props.text.length) result.push({ text: props.text.slice(last), marked: false })
  return result
})
</script>
