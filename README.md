# signals

signals for me and maybe you?


## Goals:
```typescript
const countSignal = createSignal(0)
const nameSignal = createSignal('what')

const Name = Component(function* () {
    const name = yield* nameSignal

    return yield* html`
        <div>
            ${name}
        </div>
    `
})

const Something = Component(function* () {
    const count = yield* countSignal

    return yield* html`
        <div>
            ${count}
        </div>
    `
})
```
 
