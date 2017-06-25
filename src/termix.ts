import { BehaviorSubject } from "rxjs/BehaviorSubject"

interface TermixItem<S> {
  type: TermixItemType<S>
  value: TermixSubject<S>
}

export interface TermixItemType<T> {
  new (...args: any[]): T
}

export class TermixSubject<S> extends BehaviorSubject<S> {
  constructor(private _initialState: S) {
    super(_initialState)
  }

  /**
     * Dispatch state, optionally with data argument
     * EXAMPLES:
     * - store.$dispatch(updateQuery)
     * - store.$dispatch(updateQuery, 'food')
     */
  $dispatch<DATA>(fn: (n: S, arg?: DATA) => S, arg?: DATA) {
    // latest data
    const state: S = super.getValue()
    // middleware function
    const processedValue = fn.call(null, state, arg)
    // emit
    super.next(processedValue)
  }

  /**
     * Reset state
     */
  $reset() {
    super.next(this._initialState)
  }

  /**
     * Get snapshot of current state
     */
  get $value() {
    return super.getValue()
  }
}

export class Termix {
  private _stores: TermixItem<any>[] = []

  constructor(stores: any[]) {
    for (const store of stores) {
      this._stores.push({
        type: store, // type of value
        value: new TermixSubject(store)
      })
    }
  }

  /**
     * Select store by given type
     */
  select<S>(type: TermixItemType<S>): TermixSubject<S> {
    for (const item of this._stores) {
      if (item.type instanceof type) {
        return item.value
      }
    }
  }
}
