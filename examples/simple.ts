import { createEffect, createSignal, lazy } from '../src/index'

const count = createSignal(0)
const doubled = lazy(() => count.get() * 2)

createEffect(() => {
	console.log('count is: ', count.get())
})

createEffect(() => {
	console.log('doubled is: ', doubled.get())
})

count.set(0)
count.set(1)
count.set(20)
