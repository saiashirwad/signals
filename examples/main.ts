import { createEffect, createSignal, computed, lazyComputed } from '../src'
import { bind } from '../src/events'

const inputEl = document.querySelector<HTMLInputElement>('#input')!
const input2El = document.querySelector<HTMLInputElement>('#input-2')!
const lenEl = document.querySelector<HTMLDivElement>('#len')!

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

createEffect(() => {
	lenEl.textContent = inputSignal.get().length.toString()
})
