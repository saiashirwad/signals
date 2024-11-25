/**
 * A signal is a reactive value that can be read and written to.
 * When a signal is read inside an effect, the effect will re-run when the signal's value changes.
 * When a signal is written to, all effects that depend on it will re-run.
 */

/**
 * A function that runs when its dependencies change.
 * Effects are used to perform side effects in response to reactive updates.
 */
export type EffectFn = () => void

/**
 * An Effect is an EffectFn that also tracks its dependencies.
 * The deps property stores the Set of listeners for each signal this effect depends on.
 */
export interface Effect extends EffectFn {
	deps: Set<Set<Effect>>
}

/**
 * Stack of currently running effects. The last effect in the stack is the one
 * that will be registered as a dependency when signals are read.
 *
 * Why we need this:
 * When a signal is read inside an effect, the effect will re-run when the signal's value changes.
 * But if we are inside a nested effect, we want to track the dependencies of the nested effect, not the parent.
 * This stack lets us know which effect is currently running, so we can add the correct dependencies.
 *
 * @internal
 */
let activeEffectStack: Effect[] = []
/**
 * Whether we are currently batching updates to run them all at once.
 * When batching is true, effects are queued instead of being run immediately.
 *
 * Why we need this:
 * Sometimes we want to perform multiple updates to signals as a single unit of work.
 * For example, when updating a list of items, we want to update all items in a single
 * batch so that effects depending on all items are run together.
 *
 * @internal
 */
let batching = false

/**
 * Set of effects that need to be run after the current batch is complete.
 * Effects are added to this set during batching and executed when the batch ends.
 * @internal
 */
const batchedUpdates = new Set<Effect>()

/**
 * A reactive signal that holds a value and notifies its listeners when the value changes.
 * @template T The type of the signal's value.
 */
export type Signal<T> = {
	/**
	 * Gets the current value of the signal.
	 * @returns The current value of the signal.
	 */
	get(): T
	/**
	 * Sets the value of the signal. This will notify all listeners of the change.
	 * @param newValue The new value to set.
	 */
	set(newValue: T): void
	/**
	 * Disposes of the signal, removing all listeners and preventing further updates.
	 */
	dispose(): void
	/**
	 * Returns debugging information about the signal.
	 * @returns An object containing the current value and a list of listeners.
	 */
	debug(): {
		value: T
		listeners: Effect[]
	}
}

/**
 * A computed value that is automatically updated when its dependencies change.
 * @template T The type of the computed value.
 */
export type Computed<T> = {
	/**
	 * Gets the current value of the computed value.
	 * @returns The current value of the computed value.
	 */
	get(): T
}

/**
 * A computed value that is only updated when its dependencies change and is accessed.
 * @template T The type of the lazy computed value.
 */
export type LazyComputed<T> = {
	/**
	 * Gets the current value of the lazy computed value.
	 * @returns The current value of the lazy computed value.
	 */
	get(): T
}

/**
 * Creates a new signal. A signal is a reactive primitive that can be used to track changes in a value.
 * @param initialValue The initial value of the signal.
 * @returns A new signal.
 */
export function createSignal<T>(initialValue: T): Signal<T> {
	// Store the current value of the signal
	let value = initialValue
	// Set of effects that depend on this signal's value
	const listeners = new Set<Effect>()

	return {
		get() {
			// If there is an active effect, add this signal as a dependency
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

/**
 * Batches multiple updates together to prevent unnecessary re-renders.
 * @param updateFn The function to execute within the batch.
 * @example
 * ```typescript
 * createSignal(1);
 * batch(() => {
 *  	count.set(count.get() + 1);
 *  	count.set(count.get() + 1);
 * })
 * ```
 */
export function batch(updateFn: () => void) {
	if (batching) {
		const prevStack = activeEffectStack
		activeEffectStack = []
		updateFn()
		activeEffectStack = prevStack
		return
	}
	batching = true
	try {
		updateFn()
	} finally {
		batchedUpdates.forEach((listener) => listener())
		batchedUpdates.clear()
		batching = false
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

	// wrappedEffect.deps = new Set()
	wrappedEffect()
	return wrappedEffect
}

export function computed<T>(computeFn: () => T): Computed<T> {
	let cachedValue: T
	let effect: Effect

	effect = createEffect(() => {
		cachedValue = computeFn()
	})

	return {
		get() {
			if (activeEffectStack.length > 0) {
				const activeEffect = activeEffectStack.at(-1)!
				effect.deps.forEach((dep) => {
					dep.add(activeEffect)
					activeEffect.deps.add(dep)
				})
			}
			return cachedValue
		},
	}
}

export function lazyComputed<T>(computeFn: () => T): LazyComputed<T> {
	let cachedValue: T
	let needsUpdate = true

	let effect = createEffect(() => {
		needsUpdate = true
	})

	return {
		get() {
			if (activeEffectStack.length > 0) {
				const activeEffect = activeEffectStack.at(-1)!
				effect.deps.forEach((dep) => {
					dep.add(activeEffect)
					activeEffect.deps.add(dep)
				})
			}
			if (needsUpdate) {
				cachedValue = computeFn()
				needsUpdate = false
			}
			return cachedValue
		},
	}
}
