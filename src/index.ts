export type EffectFn = () => void

export interface Effect extends EffectFn {
	deps: Set<Set<Effect>>
}

let activeEffectStack: Effect[] = []
let batching = false
const batchedUpdates = new Set<Effect>()

export type Signal<T> = {
	get(): T
	set(newValue: T): void
	dispose(): void
	debug(): {
		value: T
		listeners: Effect[]
	}
}

export type Computed<T> = {
	get(): T
}

export type LazyComputed<T> = {
	get(): T
}

export function createSignal<T>(initialValue: T): Signal<T> {
	let value = initialValue
	const listeners = new Set<Effect>()

	return {
		get() {
			if (activeEffectStack.length > 0) {
				const activeEffect = activeEffectStack.at(-1)!
				listeners.add(activeEffect)
				activeEffect.deps.add(listeners)
			}
			return value
		},
		set(newValue: T) {
			if (Object.is(value, newValue)) return
			value = newValue
			batch(() => {
				listeners.forEach((listener) => listener())
			})
		},
		dispose() {
			listeners.clear()
		},
		debug() {
			return {
				value,
				listeners: [...listeners],
			}
		},
	}
}

function batch(updateFn: () => void) {
	if (batching) {
		const prevStack = activeEffectStack
		activeEffectStack = []
		updateFn()
		activeEffectStack = prevStack
	} else {
		batching = true
		try {
			updateFn()
		} finally {
			batchedUpdates.forEach((listener) => listener())
			batchedUpdates.clear()
			batching = false
		}
	}
}

export function cleanup(effect: Effect) {
	if (effect.deps) {
		for (const dep of effect.deps) {
			dep.delete(effect)
		}
		effect.deps.clear()
	}
}

export function createEffect(effect: EffectFn) {
	const wrappedEffect = (() => {
		wrappedEffect.deps = new Set()

		activeEffectStack.push(wrappedEffect)
		try {
			cleanup(wrappedEffect)
			effect()
		} finally {
			activeEffectStack.pop()
		}
	}) as Effect

	wrappedEffect.deps = new Set()
	wrappedEffect()
	return wrappedEffect
}

export function computed<T>(computeFn: () => T): Computed<T> {
	let cachedValue: T

	createEffect(() => {
		console.log('computeFn')
		cachedValue = computeFn()
	})

	return {
		get() {
			return cachedValue
		},
	}
}

export function lazyComputed<T>(computeFn: () => T): LazyComputed<T> {
	let cachedValue: T
	let needsUpdate = true

	createEffect(() => {
		needsUpdate = true
	})

	return {
		get() {
			if (needsUpdate) {
				cachedValue = computeFn()
				needsUpdate = false
			}
			return cachedValue
		},
	}
}
