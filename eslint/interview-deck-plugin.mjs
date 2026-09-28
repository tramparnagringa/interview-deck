// @ts-check
/**
 * Local ESLint rules that enforce the style rule from AGENTS.md:
 * - `semantic-classes-only`: outside app/components/ui/, every class used in a template
 *   must be declared in the file's own <style> block. Tailwind utilities are therefore
 *   impossible to use there (they are not declared locally).
 * - `tokens-only-in-style`: <style> blocks outside ui/ may not contain literal colors or
 *   lengths. Use `var(--token)` from app/assets/css/main.css instead.
 */

const STYLE_BLOCK = /<style\b[^>]*>([\s\S]*?)<\/style>/g

/** @param {string} text */
function styleBlocks(text) {
  /** @type {{ css: string, offset: number }[]} */
  const blocks = []
  for (const match of text.matchAll(STYLE_BLOCK)) {
    const css = match[1] ?? ''
    blocks.push({ css, offset: (match.index ?? 0) + match[0].indexOf(css) })
  }
  return blocks
}

/** @param {string} text */
function declaredClasses(text) {
  const names = new Set()
  for (const { css } of styleBlocks(text)) {
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
    for (const match of withoutComments.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
      names.add(match[1])
    }
  }
  return names
}

/**
 * Collects the class names from the expression of a `:class` binding.
 * @param {any} node
 * @param {(name: string, node: any) => void} report
 */
function walkClassExpression(node, report) {
  if (!node) return
  switch (node.type) {
    case 'Literal':
      if (typeof node.value === 'string') {
        for (const name of node.value.split(/\s+/).filter(Boolean)) report(name, node)
      }
      break
    case 'TemplateLiteral':
      for (const quasi of node.quasis) {
        for (const name of quasi.value.cooked.split(/\s+/).filter(Boolean)) report(name, quasi)
      }
      for (const expression of node.expressions) walkClassExpression(expression, report)
      break
    case 'ArrayExpression':
      for (const element of node.elements) walkClassExpression(element, report)
      break
    case 'ObjectExpression':
      for (const property of node.properties) {
        if (property.type !== 'Property') continue
        if (property.computed) {
          walkClassExpression(property.key, report)
        }
        else if (property.key.type === 'Identifier') {
          report(property.key.name, property.key)
        }
        else {
          walkClassExpression(property.key, report)
        }
      }
      break
    case 'ConditionalExpression':
      walkClassExpression(node.consequent, report)
      walkClassExpression(node.alternate, report)
      break
    case 'LogicalExpression':
      walkClassExpression(node.right, report)
      break
    default:
      break
  }
}

/** @type {import('eslint').Rule.RuleModule} */
const semanticClassesOnly = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Product components may only use semantic classes declared in their own <style>.',
    },
    schema: [],
    messages: {
      undeclared:
        'Class "{{name}}" is not declared in this component\'s <style>. Product components use semantic classes styled with tokens; Tailwind utilities belong only in app/components/ui/.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode
    const parserServices = /** @type {any} */ (sourceCode.parserServices)
    if (!parserServices?.defineTemplateBodyVisitor) return {}

    const declared = declaredClasses(sourceCode.text)

    /** @param {string} name @param {any} node */
    const check = (name, node) => {
      if (!declared.has(name)) {
        context.report({ node, messageId: 'undeclared', data: { name } })
      }
    }

    return parserServices.defineTemplateBodyVisitor({
      /** @param {any} node */
      'VAttribute[directive=false][key.name=\'class\']'(node) {
        const value = node.value?.value
        if (typeof value !== 'string') return
        for (const name of value.split(/\s+/).filter(Boolean)) check(name, node)
      },
      /** @param {any} node */
      'VAttribute[directive=true][key.name.name=\'bind\'][key.argument.name=\'class\']'(node) {
        walkClassExpression(node.value?.expression, check)
      },
    })
  },
}

// Colors: hex, rgb()/hsl()/oklch() functions and named colors used as values.
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/g
// Lengths: any number with an absolute/relative length unit, except 0 and 1px hairlines.
const LENGTH_LITERAL = /(?<![\w-])(?!0(?:px|rem|em)\b)(?!1px\b)\d*\.?\d+(?:px|rem|em|vh|vw|dvh|svh|ch)\b/g

/** @type {import('eslint').Rule.RuleModule} */
const tokensOnlyInStyle = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Component <style> blocks may only use design tokens, not literal colors or sizes.',
    },
    schema: [],
    messages: {
      color: 'Literal color "{{value}}". Use a color token, e.g. var(--color-ink).',
      length: 'Literal size "{{value}}". Use a size token, e.g. var(--space-4).',
    },
  },
  create(context) {
    return {
      Program() {
        const sourceCode = context.sourceCode
        for (const { css, offset } of styleBlocks(sourceCode.text)) {
          const code = css
            .replace(/\/\*[\s\S]*?\*\//g, match => ' '.repeat(match.length))
            // Media/container query conditions cannot use var(); breakpoints are allowed there.
            .replace(/@(?:media|container)[^{]*/g, match => ' '.repeat(match.length))
          for (const [regex, messageId] of /** @type {const} */ ([[COLOR_LITERAL, 'color'], [LENGTH_LITERAL, 'length']])) {
            for (const match of code.matchAll(regex)) {
              const start = offset + (match.index ?? 0)
              context.report({
                loc: {
                  start: sourceCode.getLocFromIndex(start),
                  end: sourceCode.getLocFromIndex(start + match[0].length),
                },
                messageId,
                data: { value: match[0] },
              })
            }
          }
        }
      },
    }
  },
}

export default {
  meta: { name: 'interview-deck' },
  rules: {
    'semantic-classes-only': semanticClassesOnly,
    'tokens-only-in-style': tokensOnlyInStyle,
  },
}
