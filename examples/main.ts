import { batch, createEffect, createSignal } from '../src'
import { bind, bindList } from '../src/events'

type Todo = {
	id: number
	text: string
	status: boolean
}

function createTodoList(parentElement: Element) {
	const div = document.createElement('div')
	const input = document.createElement('input')
	input.classList.add('p-2', 'border', 'border-gray-300', 'rounded', 'w-full')
	input.placeholder = 'Enter Todo'
	const todoList = document.createElement('div')
	todoList.classList.add('flex', 'flex-col', 'gap-2', 'mt-2')

	const input$ = createSignal('')
	const todoList$ = createSignal<Todo[]>([])
	let nextId = 0

	bind('input', input$, input)

	bindList(todoList, todoList$, (todo) => {
		const todoEl = document.createElement('div')
		todoEl.classList.add('p-2', 'border', 'border-gray-300', 'rounded')

		createEffect(() => {
			todoEl.innerText = todo.text
			todoEl.style.textDecoration = todo.status ? 'line-through' : 'none'
		})

		todoEl.addEventListener('click', () => {
			const todos = todoList$.get()
			const updatedTodos = todos.map((t) =>
				t.id === todo.id ? { ...t, status: !t.status } : t,
			)
			todoList$.set(updatedTodos)
		})

		todoList.appendChild(todoEl)

		return todoEl
	})

	input.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			const todos = todoList$.get()
			batch(() => {
				todoList$.set([
					...todos,
					{ id: nextId++, status: false, text: input$.get() },
				])
				input$.set('')
			})
		}
	})

	div.appendChild(input)
	div.appendChild(todoList)
	parentElement.appendChild(div)
}

const html = String.raw

const what = html`
	<div>
		<div>hi</div>
		<div>what</div>
	</div>
`

const app = document.querySelector<HTMLDivElement>('#app')!
app.classList.add('grid', 'grid-cols-3', 'gap-4', 'p-4')
for (let i = 0; i < 3; i++) {
	const div = document.createElement('div')
	div.classList.add('border', 'border-gray-300', 'rounded', 'p-2')
	createTodoList(div)
	app.appendChild(div)
}
