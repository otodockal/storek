import { BehaviorSubject } from "rxjs/BehaviorSubject"
import { Subject } from "rxjs/Subject"
import { Observable } from "rxjs/Observable"

interface TermixItem<S> {
    type: { new(arg): S }
    value: Termix<S>
}

export class Termix<S> {
    private _subject = new BehaviorSubject<S>(this._initialState)

    constructor(private _initialState: S) { }

    /**
     * Dispatch state, optionally with data argument
     * EXAMPLES:
     * - store.$dispatch(updateQuery)
     * - store.$dispatch(updateQuery, 'food')
     */
    dispatch<DATA>(
        fn: (n: S, arg?: DATA) => S,
        arg?: {[P in keyof DATA]: DATA[P]},
    ) {
        // latest state
        const state: S = this._subject.getValue()
        // middleware function
        const processedValue = fn.call(null, state, arg)
        // emit
        this._subject.next(processedValue)
    }

    /**
     * Reset state
     */
    reset() {
        this._subject.next(this._initialState)
    }

    /**
     * An observable of the state
     */
    get $() {
        return this._subject.asObservable()
    }

    /**
     * Snapshot of current state
     */
    get snapshot() {
        return this._subject.getValue()
    }
}

export class TermixStore {
    
    private _stores: TermixItem<any>[] = []

    constructor(stores: any[]) {
        for (const store of stores) {
            const s = new store()
            this._stores.push({
                type: s,
                value: new Termix(s)
            })
        }
    }

    /**
     * Select store by given type
     */
    select<S>(type: { new(arg): S }): Termix<S> {
        for (const item of this._stores) {
            if (item.type instanceof type) {
                return item.value
            }
        }
    }
}
