import { Computed, Signal, createEffect } from './index'

/**
 * Binds a signal or computed value to an element's text content
 * @param element The element to bind to (div, span, or p)
 * @param signal The signal or computed value to bind
 * @param decode Function to convert the signal value to a string
 */
export function bindText<T>(
	element: HTMLDivElement | HTMLSpanElement | HTMLParagraphElement,
	signal: Signal<T> | Computed<T>,
	decode: (value: T) => string,
) {
	createEffect(() => {
		element.textContent = decode(signal.get())
	})
}

/**
 * Adds an event listener to an element and returns a cleanup function
 * @param element The element to add the event listener to
 * @param event The event type to listen for
 * @param handler The function to call when the event occurs
 * @returns A cleanup function that removes the event listener
 */
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

/**
 * Binds a signal to an element's value or text content,
 * and updates the signal when the element's value changes
 * @param event The event type to listen for (e.g. 'input', 'change')
 * @param signal The signal to bind to
 * @param element The element to bind to
 * @param decode Function to convert the signal value to a string
 * @param encode Function to convert the element's string value to the signal type
 */
export function bind<T>(
	event: keyof HTMLElementEventMap,
	signal: Signal<T>,
	element: Element,
	decode: (value: T) => string,
	encode: (value: string) => T,
) {
	onEvent(element, event, (e) => {
		signal.set(encode((e.target as HTMLInputElement).value))
	})
	createEffect(() => {
		if ('value' in element) {
			element.value = decode(signal.get())
		} else if ('textContent' in element) {
			element.textContent = decode(signal.get())
		}
	})
}
