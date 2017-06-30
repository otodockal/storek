# Termix
- EXPERIMENTAL thinking :)
- type safety observable store which favors simple functions and immutable pattern for updating the state
- favors using classes as a state storage since classes have a type
- favors immutable pattern - modern frameworks can take advantage of this (comparison by reference)
- group your stores (Termix) or use separately (TermixSubject)

## Examples
[test/termix.test.ts](test/termix.test.ts)

## Implementation Reasoning
- I know, inheritance of rxjs BehaviorSubject over composition is not the best idea. DX can suffer, it is mitigated by using "$" prefix for custom methods.
- From my testing...   
    - version with inheritance (current) can look like this
    ```typescript
        Observable.merge(
            myStore,
            mySecondStore,
        )
    ```
    - version favors composition (not implemented) can be like this
    ```typescript
        Observable.merge(
            myStore.valueChanges$,
            mySecondStore.valueChanges$,
        )
    ```

## TODO
- add more examples

## Credits
- ngrx
- redux
