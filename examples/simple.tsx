import { computed, createEffect, createSignal, lazyComputed } from '../src'

const count = createSignal(0)

const doubled = computed(() => {
	console.log('Computing doubled')
	const result = count.get() * 2
	console.log('Doubled is: ', result)
	return result
})

const doubledLazy = lazyComputed(() => {
	console.log('Computing doubledLazy')
	return count.get() * 2
})

createEffect(() => {
	console.log('count is: ', count.get())
})

createEffect(() => {
	console.log('doubled is: ', doubled.get())
})

createEffect(() => {
	console.log('count changed but doubledLazy not accessed')
})

count.set(0)
count.set(1)
count.set(20)

console.log('finally accessing doubledLazy:', doubledLazy.get())
