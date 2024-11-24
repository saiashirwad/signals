import { computed, createSignal, lazyComputed } from '../src'

const count = createSignal(0)

const doubled = computed(() => count.get() * 2)
const doubledLazy = lazyComputed(() => count.get() * 2)

// DOM elements
const countEl = document.getElementById('count')!
const doubledEl = document.getElementById('doubled')!
const doubledLazyEl = document.getElementById('doubled-lazy')!
const incrementBtn = document.getElementById('increment')!

function updateDOM() {
	countEl.textContent = count.get().toString()
	doubledEl.textContent = doubled.get().toString()
	doubledLazyEl.textContent = doubledLazy.get().toString()
}

updateDOM()

incrementBtn.addEventListener('click', () => {
	count.set(count.get() + 1)
	updateDOM()
})
