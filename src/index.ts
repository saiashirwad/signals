type EffectFn = () => void

interface Effect extends EffectFn {
	deps: Set<Set<Effect>>
}

let activeEffectStack: Effect[] = []
let batching = false
let batchedUpdates = new Set<Effect>()

type Signal<T> = {
	get(): T
	set(newValue: T): void
	debug(): {
		value: T
		listeners: Effect[]
	}
}

type Computed<T> = {
	get(): T
}

export function createSignal<T>(initialValue: T): Signal<T> {
	let value = initialValue
	const listeners = new Set<Effect>()

	const signal = {
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
		debug() {
			return {
				value,
				listeners: [...listeners],
			}
		},
	}

	return signal
}

function batch(updateFn: () => void) {
	if (batching) {
		updateFn()
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
	console.log('cleanup')
	if (effect.deps) {
		for (const dep of effect.deps) {
			dep.delete(effect)
		}
		effect.deps.clear()
	}
}

export function createEffect(effect: EffectFn) {
	const wrappedEffect = (() => {
		const prevDeps = wrappedEffect.deps
		wrappedEffect.deps = new Set()

		activeEffectStack.push(wrappedEffect)
		try {
			effect()
		} finally {
			activeEffectStack.pop()
			if (prevDeps) {
				for (const dep of prevDeps) {
					dep.delete(wrappedEffect)
				}
			}
		}
	}) as Effect

	wrappedEffect.deps = new Set()
	wrappedEffect()
	return wrappedEffect
}

export function computed<T>(computeFn: () => T): Computed<T> {
	let cachedValue: T
	let dirty = true

	createEffect(() => {
		computeFn()
		dirty = true
	})

	return {
		get() {
			if (dirty) {
				cachedValue = computeFn()
				dirty = false
			}
			return cachedValue
		},
	}
}

export function lazy<T>(computeFn: () => T): Computed<T> {
	let cachedValue: T
	let needsUpdate = true

	const derivedSignal = {
		get() {
			if (needsUpdate) {
				cachedValue = computeFn()
				needsUpdate = false
			}
			return cachedValue
		},
	}

	createEffect(() => {
		computeFn()
		needsUpdate = true
	})

	return derivedSignal
}
