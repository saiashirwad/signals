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

## Todo List
```typescript
import { batch, createSignal, computed, createEffect, bind, bindHTML } from '@texoport/signals'

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
	<div>
		<input id="input" placeholder="Enter Todo" />
		<div id="list"></div>
	</div>
`

const input = document.getElementById('input')!
const todoList = document.getElementById('list')!

type Todo = {
	id: number
	text: string
	status: boolean
}

const input$ = createSignal('')
const todoList$ = createSignal<Todo[]>([])
let nextId = 0

bind('input', input$, input)

bindHTML(todoList, todoList$, (todos) => {
	const container = document.createElement('div')

	todos.forEach((todo) => {
		const todoState$ = computed(() => {
			const allTodos = todoList$.get()
			return allTodos.find((t) => t.id === todo.id)!
		})

		const todoEl = document.createElement('div')

		createEffect(() => {
			const currentTodo = todoState$.get()
			todoEl.innerText = currentTodo.text
			todoEl.style.textDecoration = currentTodo.status ? 'line-through' : 'none'
		})

		todoEl.addEventListener('click', () => {
			const todos = todoList$.get()
			const updatedTodos = todos.map((t) =>
				t.id === todo.id ? { ...t, status: !t.status } : t,
			)
			todoList$.set(updatedTodos)
		})

		container.appendChild(todoEl)
	})

	return container
})

input.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		const todos = todoList$.get()
		batch(() => {
			todoList$.set([
				...todos,
				{
					id: nextId++,
					status: false,
					text: input$.get(),
				},
			])
			input$.set('')
		})
	}
})

```