import { Signal, createSignal } from '../src'
import { $, $$ } from '../src/dom'

const Button = (
	text: string | number | Signal<unknown>,
	onClick: (e: Event) => void,
) => {
	return $$([
		'button.border.border-gray-300.rounded.p-2',
		{ click: onClick },
		[text],
	])
}

const Counter = () => {
	const count$ = createSignal(-2)
	return $([
		'div.p-4.flex.gap-4',
		{},
		[
			Button('-', (e) => {
				count$.set(count$.get() - 1)
			}),
			['span.p-2', {}, [count$]],
			Button('+', (e) => {
				count$.set(count$.get() + 1)
			}),
		],
	])
}

const app = document.querySelector<HTMLDivElement>('#app')!
app.appendChild(Counter())
