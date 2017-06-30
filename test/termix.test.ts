import { Termix, TermixSubject } from "../src/termix"
import { Observable, Subscription } from "rxjs"

// Example #1
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

// Example #2
type FilterStoreType = "red" | "blue" | "green"

class FilterStore {
  query = ""
  types: FilterStoreType[] = []
}

function setQuery(state: FilterStore, query: string) {
  return {
    ...state,
    query
  }
}

function addType(state: FilterStore, type: FilterStoreType) {
  return {
    ...state,
    types: [...state.types, type]
  }
}

function deleteType(state: FilterStore, type: FilterStoreType) {
  return {
    ...state,
    types: state.types.filter(item => item !== type)
  }
}

export const listOfStores = [new MyStore(), new FilterStore()]

describe("Termix test", () => {
  it("should select MyStore", () => {
    const termix = new Termix(listOfStores)
    const store = termix.select(MyStore)
    expect(store.$value).toEqual({ one: 1, two: 2 })
  })

  it("should select FilterStore", () => {
    const termix = new Termix(listOfStores)
    const store = termix.select(FilterStore)
    expect(store.$value).toEqual({
      query: "",
      types: []
    })
  })

  it("should update MyStore without action value", () => {
    const termix = new Termix(listOfStores)
    const store = termix.select(MyStore)

    expect(store.$value).toEqual({ one: 1, two: 2 })

    store.$dispatch(updateOne)

    expect(store.$value).toEqual({ one: 2, two: 2 })
  })

  it("should set/reset prop of FilterStore", () => {
    const termix = new Termix(listOfStores)
    const store = termix.select(FilterStore)

    expect(store.$value).toEqual({
      query: "",
      types: []
    })

    store.$dispatch(setQuery, "cool")

    expect(store.$value).toEqual({
      query: "cool",
      types: []
    })

    store.$reset()

    expect(store.$value).toEqual({
      query: "",
      types: []
    })
  })

  it("should combine stores", () => {
    const termix = new Termix(listOfStores)
    const store = termix.select(FilterStore)
    const store1 = termix.select(MyStore)

    const obs = Observable.combineLatest(
      store.skip(1),
      store1.skip(1)
    ).subscribe(([val1, val2]) => {
      expect(val1).toEqual({
        query: "oto",
        types: []
      })
      expect(val2).toEqual({ one: 2, two: 2 })
      obs.unsubscribe()
    })

    store.$dispatch(setQuery, "oto")
    store1.$dispatch(updateOne)
  })

  it("should combine stores and pick only particular part of a store", done => {
    const termix = new Termix(listOfStores)
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

  it("should add / delete type", () => {
    const termix = new Termix(listOfStores)
    const store = termix.select(FilterStore)

    store.$dispatch(addType, "red")
    store.$dispatch(addType, "green")

    expect(store.$value.types).toEqual(["red", "green"])

    store.$dispatch(deleteType, "red")

    expect(store.$value.types).toEqual(["green"])
  })

  it("should use only TermixSubject", () => {
    const store = new TermixSubject(new MyStore())

    store.$dispatch(updateOne)

    expect(store.$value.one).toBe(2)
  })
})
