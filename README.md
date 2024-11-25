# signals
signals for me and maybe you?

## Installing
```bash
bun add @texoport/signals
```

## Simple Example
```typescript
import { computed, createEffect, createSignal } from '@texoport/signals'

const count = createSignal(0)

setInterval(() => {
  count.set(count.get() + 1)
}, 100)

const double = computed(() => count.get() * 2)
const triple = computed(() => count.get() * 3)

const more = computed(() => double.get() + triple.get())

createEffect(() => {
  console.log({
    count: count.get(),
    double: double.get(),
    triple: triple.get(),
    more: more.get(),
  })
})
```

## Counter
```typescript
import { createSignal } from '@texoport/signals'
import { $ } from '@texoport/signals/dom'

const Button = (
	text: string | number | Signal<unknown>,
	onClick: (e: Event) => void,
): $Element => {
	return [
		'button.border.border-gray-300.rounded.p-2',
		{ click: onClick },
		[text],
	]
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
```

## Todo List
```typescript
import { batch, createEffect, createSignal } from '@texoport/signals'
import { bind, bindList } from '@texoport/signals/events'

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

const app = document.querySelector<HTMLDivElement>('#app')!
app.classList.add('grid', 'grid-cols-3', 'gap-4', 'p-4')
for (let i = 0; i < 3; i++) {
	const div = document.createElement('div')
	div.classList.add('border', 'border-gray-300', 'rounded', 'p-2')
	createTodoList(div)
	app.appendChild(div)
}

```

# Goals

```typescript
function Counter() {
	const count = createSignal(0)
	return $(
		"div.flex.gap-2", [
		$('button.bg-blue-500.text-white.rounded.p-2', { onclick: () => count.set(count.get() + 1) }, '+'),
		count.get(),
		$('button.bg-blue-500.text-white.rounded.p-2', { onclick: () => count.set(count.get() - 1) }, '-'),
	])
}

type Todo = {
	id: number
	text: string
	status: 'pending' | 'done'
}

function TodoItem(todo: Todo) {
	return $(
		"div.border.border-gray-300.rounded.p-2", [
		todo.text,
		$('button.bg-blue-500.text-white.rounded.p-2', { onclick: () => todo.status = 'done' }, 'Done'),
	])
}

function TodoList() {
	const input$ = createSignal('')
	const todoList$ = createSignal<Todo[]>([])

	return $(
		"div.flex.flex-col.gap-4", [
		$('div.text-2xl.font-bold', ['Todo List']),
		$('input', {
			oninput: (e) => input$.set(e.target.value),
			onkeydown: (e) => {
				if (e.key === 'Enter') {
					batch(() => {
						todoList$.update((todos) => [
							...todos,
							{ id: nextId++, text: input$.get(), status: 'pending' },
						])
						input$.set('')
					})
				}
			},
		}),
		todoList$.map((todos) => todos.map(TodoItem)),
	])
}

```