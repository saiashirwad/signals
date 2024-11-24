import { Computed, Signal, createEffect } from './index'

export function bindText<T>(
	element: HTMLDivElement | HTMLSpanElement | HTMLParagraphElement,
	signal: Signal<T> | Computed<T>,
	decode: (value: T) => string,
) {
	createEffect(() => {
		element.textContent = decode(signal.get())
	})
}

export function onEvent(
	element: Element,
	event: keyof HTMLElementEventMap,
	handler: (e: Event) => void,
) {
	element.addEventListener(event, handler)
	return () => {
		element.removeEventListener(event, handler)
	}
}

export function bindEvent<T>(_: {
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
