import { RuleTester } from 'eslint'
import vueParser from 'vue-eslint-parser'
import { describe, it } from 'vitest'
import plugin from '../../eslint/interview-deck-plugin.mjs'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({ languageOptions: { parser: vueParser, ecmaVersion: 2022, sourceType: 'module' } })
const vue = (template: string, style: string) => `<template>${template}</template>\n<style scoped>${style}</style>`

tester.run('semantic-classes-only', plugin.rules['semantic-classes-only'], {
  valid: [
    vue('<div class="deck-stack"><span :class="{ \'deck-stack-card\': true }" /></div>', '.deck-stack {} .deck-stack-card {}'),
  ],
  invalid: [
    { code: vue('<div class="deck-stack flex" />', '.deck-stack {}'), errors: [{ messageId: 'undeclared' }] },
    { code: vue('<div :class="[ok ? \'mt-4\' : \'deck\']" />', '.deck {}'), errors: [{ messageId: 'undeclared' }] },
  ],
})

tester.run('tokens-only-in-style', plugin.rules['tokens-only-in-style'], {
  valid: [
    vue('<div class="a" />', '.a { color: var(--color-ink); border: 1px solid var(--color-border); margin: 0; }'),
    vue('<div class="a" />', '@media (min-width: 48rem) { .a { gap: var(--space-4); } }'),
  ],
  invalid: [
    { code: vue('<div class="a" />', '.a { color: #fff; }'), errors: [{ messageId: 'color' }] },
    { code: vue('<div class="a" />', '.a { padding: 12px; }'), errors: [{ messageId: 'length' }] },
    { code: vue('<div class="a" />', '.a { background: rgb(0 0 0); }'), errors: [{ messageId: 'color' }] },
  ],
})
