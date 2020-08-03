# Run tests

Module has some tests for the Kahn topological sorting algorithm implementation:

```bash
deno test test/KahnGraphTest.ts
```

# Usage

## Build the graph

Module support nodes which implements **IEntity** interface (id string field for mapping). 

Graph supports to add nodes or edges:

```typescript
const graph = new KahnGraph()
    .addNode({id: "1"})
    .addNode({id: "4"})
    .addEdge({id: "1"}, {id: "2"})
    .addEdge({id: "2"}, {id: "3"});
```

## Sort topologically

You can sort the current graph state by calling the sort method on the graph:

```typescript
const graph = new KahnGraph(); // Build the graph
graph.sort();
```

The sort does not modify the state of the graph, it clones its state, so you can add nodes /edges after sort and apply a new sort.
