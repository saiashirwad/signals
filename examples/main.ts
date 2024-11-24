import { computed, createEffect, createSignal } from '../src'
import { bindEvent } from '../src/events'

const inputEl = document.querySelector<HTMLInputElement>('#input')!
const inputSignal = createSignal('')

bindEvent({
	event: 'input',
	element: inputEl,
	signal: inputSignal,
	decode: (x) => x,
	encode: (x) => x,
})

const duplicatedInput = computed(() => {
	const input = inputSignal.get()
	console.log('duplicatedInput', `${input}${input}`)
	return `${input}${input}`
})

const length = computed(() => {
	console.log('length', duplicatedInput.get().length)
	return duplicatedInput.get().length
})

createEffect(() => {
	const currentLength = length.get()
	const currentDuplicated = duplicatedInput.get()
	console.log({ length: currentLength })
	console.log({ duplicatedInput: currentDuplicated })
})
