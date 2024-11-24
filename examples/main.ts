import { computed, createEffect, createSignal } from '../src'

const inputEl = document.getElementById('input') as HTMLInputElement
// const outputEl = document.getElementById('output') as HTMLDivElement
// const duplicatedOutputEl = document.getElementById(
// 	'duplicated-output',
// ) as HTMLDivElement
// const duplicatedOutput2El = document.getElementById(
// 	'duplicated-output-2',
// ) as HTMLDivElement

// function bindText<T>(
// 	element: HTMLDivElement | HTMLSpanElement | HTMLParagraphElement,
// 	signal: Signal<T> | Computed<T>,
// 	decode: (value: T) => string,
// ) {
// 	createEffect(() => {
// 		element.textContent = decode(signal.get())
// 	})
// }

// function onEvent(
// 	element: Element,
// 	event: keyof HTMLElementEventMap,
// 	handler: (e: Event) => void,
// ) {
// 	element.addEventListener(event, handler)
// 	return () => {
// 		element.removeEventListener(event, handler)
// 	}
// }

// function bindEvent<T>(
// 	element: Element,
// 	signal: Signal<T>,
// 	event: keyof HTMLElementEventMap,
// 	decode: (value: T) => string,
// 	encode: (value: string) => T,
// ) {
// 	onEvent(element, event, (e) => {
// 		signal.set(encode((e.target as HTMLInputElement).value))
// 	})
// 	createEffect(() => {
// 		if ('value' in element) {
// 			element.value = decode(signal.get())
// 		} else if ('textContent' in element) {
// 			element.textContent = decode(signal.get())
// 		}
// 	})
// }

const inputSignal = createSignal('')
inputEl.addEventListener('input', (e) => {
	inputSignal.set((e.target as HTMLInputElement).value)
})

// bindEvent(
// 	inputEl,
// 	inputSignal,
// 	'input',
// 	(value) => value,
// 	(value) => value,
// )

createEffect(() => {
	console.log('inputSignal', inputSignal.get())
})

const duplicatedInput = computed(() => {
	const input = inputSignal.get()
	return `${input}${input}`
})

const length = computed(() => duplicatedInput.get().length)

createEffect(() => {
	const currentLength = length.get()
	const currentDuplicated = duplicatedInput.get()
	console.log({ length: currentLength })
	console.log({ duplicatedInput: currentDuplicated })
})

// bindText(outputEl, duplicatedInput, (value) => value)
// bindText(duplicatedOutputEl, duplicatedInput, (value) => value)
// bindText(duplicatedOutput2El, duplicatedInput, (value) => value)
