import { Computed, Signal, computed, createEffect, createSignal } from '../src'

const identity = <T>(value: T) => value

function bindText<T>(
	element: HTMLDivElement | HTMLSpanElement | HTMLParagraphElement,
	signal: Signal<T> | Computed<T>,
	decode: (value: T) => string,
) {
	createEffect(() => {
		element.textContent = decode(signal.get())
	})
}

function onEvent(
	element: Element,
	event: keyof HTMLElementEventMap,
	handler: (e: Event) => void,
) {
	element.addEventListener(event, handler)
	return () => {
		element.removeEventListener(event, handler)
	}
}

function bindEvent<T>(_: {
	event: keyof HTMLElementEventMap
	signal: Signal<T>
	element: Element
	decode: (value: T) => string
	encode: (value: string) => T
}) {
	onEvent(_.element, _.event, (e) => {
		_.signal.set(_.encode((e.target as HTMLInputElement).value))
	})
	createEffect(() => {
		if ('value' in _.element) {
			_.element.value = _.decode(_.signal.get())
		} else if ('textContent' in _.element) {
			_.element.textContent = _.decode(_.signal.get())
		}
	})
}

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
