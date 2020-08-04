import { assertEquals, fail, assertThrows } from "https://deno.land/std@0.63.0/testing/asserts.ts";
import { KahnGraph } from "../../../lib/sort/topological/KahnGraph.ts";
import { CyclicGraphError } from "../../../lib/graph/errors/CyclicGraphError.ts";

function n(id: string) {
    return {id};
}

Deno.test("should sort DAG graphs properly", () => {
    assertEquals(
        new KahnGraph()
            .addEdge(n("1"), n("2"))
            .addEdge(n("2"), n("3"))
            .sort(),
        [n("1"), n("2"), n("3")]
    );
});

Deno.test("should sort more complicated DAG graphs properly", () => {
    const result = new KahnGraph()
        .addEdge(n("5"), n("1"))
        .addEdge(n("7"), n("1"))
        .addEdge(n("7"), n("0"))
        .addEdge(n("3"), n("0"))
        .addEdge(n("0"), n("6"))
        .addEdge(n("1"), n("6"))
        .addEdge(n("3"), n("4"))
        .addEdge(n("1"), n("4"))
        .addEdge(n("1"), n("2"))
        .sort();
    assertEquals(
        result,
        [n("5"), n("7"), n("3"), n("1"), n("0"), n("4"), n("2"), n("6")]
    );
});

Deno.test("should detect cyclic graphs", () => {
    assertThrows(() => {
        new KahnGraph()
            .addEdge(n("1"), n("2"))
            .addEdge(n("2"), n("3"))
            .addEdge(n("3"), n("1"))
            .addEdge(n("4"), n("1"))
            .sort();
    }, CyclicGraphError, "Graph has cyclic sub-graph (of elements 3)");
});

Deno.test("should re-run sort on the same graph", () => {
    const graph = new KahnGraph().addEdge(n("1"), n("2"));
    assertEquals(graph.sort(), [n("1"), n("2")]);
    graph.addEdge(n("2"), n("3"));
    assertEquals(graph.sort(), [n("1"), n("2"), n("3")]);
})
