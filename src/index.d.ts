type EffectFn = () => void;
interface Effect extends EffectFn {
    deps: Set<Set<Effect>>;
}
declare let activeEffectStack: Effect[];
declare let batching: boolean;
declare let batchedUpdates: Set<Effect>;
type Signal<T> = {
    get(): T;
    set(newValue: T): void;
    debug(): {
        value: T;
        listeners: Effect[];
    };
};
type Computed<T> = {
    get(): T;
};
declare function createSignal<T>(initialValue: T): Signal<T>;
declare function batch(updateFn: () => void): void;
declare function cleanup(effect: Effect): void;
declare function createEffect(effect: EffectFn): Effect;
declare function computed<T>(computeFn: () => T): Computed<T>;
declare function lazy<T>(computeFn: () => T): Computed<T>;
declare const count: Signal<number>;
declare const doubled: Computed<number>;
