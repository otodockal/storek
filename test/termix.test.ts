import { Termix, TermixStore } from "../src/termix"
import { Observable, Subscription } from "rxjs"

// Example #1
class MySimpleState {
  one = 1
  two = 2
}
function updateOne(state: MySimpleState) {
  return {
    ...state,
    one: state.one + 1
  }
}

// Example #2
type FilterStateType = "red" | "blue" | "green"

class FilterState {
  query = ""
  types: FilterStateType[] = []
}

function setQuery(state: FilterState, query: string) {
  return {
    ...state,
    query
  }
}

function addType(state: FilterState, type: FilterStateType) {
  return {
    ...state,
    types: [...state.types, type]
  }
}

function deleteType(state: FilterState, type: FilterStateType) {
  return {
    ...state,
    types: state.types.filter(item => item !== type)
  }
}

export const listOfStates = [new MySimpleState(), new FilterState()]

describe("Termix test", () => {
  it("should select MyStore", () => {
    const termixStore = new TermixStore(listOfStates)
    const store = termixStore.select(MySimpleState)
    expect(store.snapshot).toEqual({ one: 1, two: 2 })
  })

  it("should select FilterStore", () => {
    const termix = new TermixStore(listOfStates)
    const store = termix.select(FilterState)
    expect(store.snapshot).toEqual({
      query: "",
      types: []
    })
  })

  it("should update MyStore without action value", () => {
    const termixStore = new TermixStore(listOfStates)
    const store = termixStore.select(MySimpleState)

    expect(store.snapshot).toEqual({ one: 1, two: 2 })

    store.dispatch(updateOne)

    expect(store.snapshot).toEqual({ one: 2, two: 2 })
  })

  it("should set/reset prop of FilterStore", () => {
    const termixStore = new TermixStore(listOfStates)
    const store = termixStore.select(FilterState)

    expect(store.snapshot).toEqual({
      query: "",
      types: []
    })

    store.dispatch(setQuery, "cool")

    expect(store.snapshot).toEqual({
      query: "cool",
      types: []
    })

    store.reset()

    expect(store.snapshot).toEqual({
      query: "",
      types: []
    })
  })

  it("should combine stores", () => {
    const termixStore = new TermixStore(listOfStates)
    const store = termixStore.select(FilterState)
    const store1 = termixStore.select(MySimpleState)

    const obs = Observable.combineLatest(
      store.$.skip(1),
      store1.$.skip(1)
    ).subscribe(([val1, val2]) => {
      expect(val1).toEqual({
        query: "oto",
        types: []
      })
      expect(val2).toEqual({ one: 2, two: 2 })
      obs.unsubscribe()
    })

    store.dispatch(setQuery, "oto")
    store1.dispatch(updateOne)
  })

  it("should combine stores and pick only particular part of a store", done => {
    const termixStore = new TermixStore(listOfStates)
    const store = termixStore.select(FilterState)
    const store1 = termixStore.select(MySimpleState)

    const obs = Observable.combineLatest(
      store.$.skip(1).map(item => item.query),
      store1.$.skip(1).map(item => item.one)
    ).subscribe(res => {
      expect(res).toEqual(["oto", 2])
      obs.unsubscribe()
      done()
    })

    store.dispatch(setQuery, "oto")
    store1.dispatch(updateOne)
  })

  it("should add / delete type", () => {
    const termixStore = new TermixStore(listOfStates)
    const store = termixStore.select(FilterState)

    store.dispatch(addType, "red")
    store.dispatch(addType, "green")

    expect(store.snapshot.types).toEqual(["red", "green"])

    store.dispatch(deleteType, "red")

    expect(store.snapshot.types).toEqual(["green"])
  })

  it("should use only TermixSubject", () => {
    const store = new Termix(new MySimpleState())

    store.dispatch(updateOne)

    expect(store.snapshot.one).toBe(2)
  })
})
