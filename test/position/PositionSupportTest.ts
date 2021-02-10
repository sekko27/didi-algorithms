import { assertEquals } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { PositionSupport } from "../../lib/position/PositionSupport.ts";
import { KahnGraph } from "../../lib/sort/topological/KahnGraph.ts";

function e(id: number) {
    return {id: String(id)};
}

Deno.test("positioning test #1", () => {
    assertEquals(
        new PositionSupport(() => new KahnGraph())
            .elem(e(1))
            .elem(e(2)).after("1")
            .elem(e(3)).before("1").after("4")
            .elem(e(4))
            .sort(),
        [e(4), e(3), e(1), e(2)]
    )
});

Deno.test("concatenation", () => {
    const p1 = new PositionSupport().elem(e(1)).elem(e(2)).after("1");
    const p2 = new PositionSupport().elem(e(1)).elem(e(3)).after("2");
    const sorted = p1.concat(p2).sort();
    assertEquals(sorted, [e(1), e(2), e(3)]);
})
