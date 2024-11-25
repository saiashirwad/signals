import { computed, createEffect, createSignal } from '../src'
import { bind, bindText } from '../src/events'

const inputEl = document.querySelector<HTMLInputElement>('#input')!
const input2El = document.querySelector<HTMLInputElement>('#input-2')!
const lenEl = document.querySelector<HTMLDivElement>('#len')!
const debugEl = document.querySelector<HTMLPreElement>('#debug')!

const inputSignal = createSignal('')

bind(
	'input',
	inputSignal,
	inputEl,
	(x) => x,
	(x) => x,
)

bind(
	'input',
	inputSignal,
	input2El,
	(x) => x,
	(x) => x,
)

const double = computed(() => `${inputSignal.get()}${inputSignal.get()}`)
const triple = computed(() => `${double.get()}${double.get()}`)

bindText(debugEl, triple, (x) => JSON.stringify({ x }, null, 2))

createEffect(() => {
	lenEl.textContent = inputSignal.get().length.toString()
})
