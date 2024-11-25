import { computed, createEffect, createSignal } from '../src'

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
