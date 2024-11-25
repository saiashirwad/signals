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

export function bindHTML<T>(
	element: Element,
	signal: Signal<T> | Computed<T>,
	decode: (value: T) => Element,
) {
	let currentElement = element
	createEffect(() => {
		const newElement = decode(signal.get())
		currentElement.replaceWith(newElement)
		currentElement = newElement
	})
}

export function bindList<T>(
	parent: Element,
	signal: Signal<T[]> | Computed<T[]>,
	decode: (value: T) => Element,
) {
	let currentElements: Element[] = []
	createEffect(() => {
		const newElements = signal.get().map(decode)
		const diff = arrayDiff(currentElements, newElements)
		diff.forEach((item) => {
			if (item.type === 'added') {
				parent.appendChild(item.element)
			} else if (item.type === 'removed') {
				parent.removeChild(item.element)
			} else {
				item.element.replaceWith(item.element)
			}
		})
		currentElements = newElements
	})
}

interface DiffItem<T> {
	type: 'added' | 'removed' | 'updated'
	element: Element
}

function arrayDiff<T>(oldArray: T[], newArray: T[]): DiffItem<T>[] {
	const diff: DiffItem<T>[] = []
	const oldSet = new Set(oldArray)
	const newSet = new Set(newArray)

	oldArray.forEach((item, index) => {
		if (!newSet.has(item)) {
			diff.push({ type: 'removed', element: item as unknown as Element })
		}
	})

	newArray.forEach((item, index) => {
		if (!oldSet.has(item)) {
			diff.push({ type: 'added', element: item as unknown as Element })
		}
	})

	return diff
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
	decode?: (value: T) => string,
	encode?: (value: string) => T,
) {
	const _decode = decode ?? ((x: T) => x as string)
	const _encode = encode ?? ((x: string) => x as T)
	onEvent(element, event, (e) => {
		signal.set(_encode((e.target as HTMLInputElement).value))
	})
	createEffect(() => {
		if ('value' in element) {
			element.value = _decode(signal.get())
		} else if ('textContent' in element) {
			element.textContent = _decode(signal.get())
		}
	})
}
