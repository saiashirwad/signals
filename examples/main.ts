import { createSignal } from '../src'
import { $ } from '../src/dom'

const Counter = () => {
	const count$ = createSignal(-2)
	return $([
		'div.p-4.flex.gap-4',
		{},
		[
			[
				'button.border.border-gray-300.rounded.p-2',
				{
					click: (e) => {
						console.log(e)
						count$.set(count$.get() - 1)
					},
				},
				['-'],
			],
			['span.p-2', {}, [count$]],
			[
				'button.border.border-gray-300.rounded.p-2',
				{
					click: (e) => {
						count$.set(count$.get() + 1)
					},
				},
				['+'],
			],
		],
	])
}

const app = document.querySelector<HTMLDivElement>('#app')!
app.appendChild(Counter())
