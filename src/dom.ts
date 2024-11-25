import { Signal, createEffect } from '.'

export type $Element = [
	selector: string,
	callbacks: Partial<Record<keyof HTMLElementEventMap, (e: Event) => void>>,
	children?: (string | $Element | number | Signal<unknown>)[],
]

export function $(e: $Element) {
	const [selector, callbacks, children] = e
	const [tag, ...classes] = selector.split('.')
	if (!tag) throw new Error('No tag provided')
	const element = document.createElement(tag)
	element.classList.add(...classes)
	for (const [event, handler] of Object.entries(callbacks)) {
		createEffect(() => {
			element.addEventListener(event, handler)
		})
	}
	if (!children) return element
	for (const child of children) {
		if (typeof child === 'string' || typeof child === 'number') {
			element.appendChild(document.createTextNode(child.toString()))
		} else if ('get' in child) {
			const textNode = document.createTextNode('')
			createEffect(() => {
				// @ts-ignore
				textNode.textContent = child.get().toString()
			})
			element.appendChild(textNode)
		} else {
			const childNode = $(child)
			if (!childNode) {
				throw new Error(`No child node found for ${child}`)
			}
			element.appendChild(childNode)
		}
	}
	return element
}

export function $$(e: $Element) {
	return e
}
