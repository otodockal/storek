import { Termix } from "../src/termix"
import { Observable, Subscription } from "rxjs"

// Functions
class MyStore {
  one = 1
  two = 2
}
function updateOne(state: MyStore) {
  return {
    ...state,
    one: state.one + 1
  }
}

class FilterStore {
  query = ""
  statuses = []
  industries = []
  types = []
  channels = []
  liked = false
}

function setQuery(state: FilterStore, query: string) {
  return {
    ...state,
    query
  }
}

export const arr = [new MyStore(), new FilterStore()]

describe("Termix test", () => {
  it("should select MyStore", () => {
    const termix = new Termix(arr)
    const store = termix.select(MyStore)
    expect(_toPOJO(store.$value)).toEqual({ one: 1, two: 2 })
  })

  it("should select FilterStore", () => {
    const termix = new Termix(arr)
    const store = termix.select(FilterStore)
    expect(_toPOJO(store.$value)).toEqual({
      query: "",
      statuses: [],
      industries: [],
      types: [],
      channels: [],
      liked: false
    })
  })

  it("should update MyStore without action value", () => {
    const termix = new Termix(arr)
    const store = termix.select(MyStore)

    expect(_toPOJO(store.$value)).toEqual({ one: 1, two: 2 })

    store.$dispatch(updateOne)

    expect(_toPOJO(store.$value)).toEqual({ one: 2, two: 2 })
  })

  it("should set/reset prop of FilterStore", () => {
    const termix = new Termix(arr)
    const store = termix.select(FilterStore)

    expect(_toPOJO(store.$value)).toEqual({
      query: "",
      statuses: [],
      industries: [],
      types: [],
      channels: [],
      liked: false
    })

    store.$dispatch(setQuery, "cool")

    expect(_toPOJO(store.$value)).toEqual({
      query: "cool",
      statuses: [],
      industries: [],
      types: [],
      channels: [],
      liked: false
    })

    store.$reset()

    expect(_toPOJO(store.$value)).toEqual({
      query: "",
      statuses: [],
      industries: [],
      types: [],
      channels: [],
      liked: false
    })
  })

  it("should combine stores", () => {
    const termix = new Termix(arr)
    const store = termix.select(FilterStore)
    const store1 = termix.select(MyStore)

    const obs = Observable.combineLatest(
      store.skip(1),
      store1.skip(1)
    ).subscribe(([val1, val2]) => {
      expect(_toPOJO(val1)).toEqual({
        query: "oto",
        statuses: [],
        industries: [],
        types: [],
        channels: [],
        liked: false
      })
      expect(_toPOJO(val2)).toEqual({ one: 2, two: 2 })
      obs.unsubscribe()
    })

    store.$dispatch(setQuery, "oto")
    store1.$dispatch(updateOne)
  })

  it("should combine stores and pick only particular part of a store", done => {
    const termix = new Termix(arr)
    const store = termix.select(FilterStore)
    const store1 = termix.select(MyStore)

    const obs = Observable.combineLatest(
      store.skip(1).map(item => item.query),
      store1.skip(1).map(item => item.one)
    ).subscribe(res => {
      expect(res).toEqual(["oto", 2])
      obs.unsubscribe()
      done()
    })

    store.$dispatch(setQuery, "oto")
    store1.$dispatch(updateOne)
  })
})

function _toPOJO(value) {
  return JSON.parse(JSON.stringify(value))
}
