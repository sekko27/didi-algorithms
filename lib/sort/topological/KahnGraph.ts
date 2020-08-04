import { IEntity } from "../../common/interfaces/IEntity.ts";
import { CyclicGraphError } from "../../graph/errors/CyclicGraphError.ts";
import { IGraph } from "../../graph/IGraph.ts";

export class KahnGraph<N extends IEntity> implements IGraph<N>{
    /**
     * Hash by node identifier to index.
     */
    readonly #nodeIdToIndexMap: Map<string, number> = new Map();

    /**
     * Reverse mapping from index to node representation.
     */
    readonly #indexToNodeMap: N[] = [];

    /**
     * Stores the node in-degrees by index.
     */
    readonly #inDegrees: number[] = [];

    /**
     * Stores the set of node indexes the current node connected to.
     */
    readonly #internal: Set<number>[] = [];

    private registerNode(node: N): number {
       if (!this.#nodeIdToIndexMap.has(node.id)) {
            const index = this.#indexToNodeMap.push(node) - 1;
            this.#nodeIdToIndexMap.set(node.id, index);
            this.#internal.push(new Set());
            this.#inDegrees.push(0);
            return index;
        } else {
            return this.#nodeIdToIndexMap.get(node.id) as number;
        }
    }

    public addNode(node: N): this {
        this.registerNode(node);
        return this;
    }

    public addEdge(from: N, to: N): this {
        const fromIndex = this.registerNode(from);
        const toIndex = this.registerNode(to);
        this.#internal[fromIndex].add(toIndex);
        this.#inDegrees[toIndex]++;
        return this;
    }

    public sort(): N[] {
        // Clone the in-degrees
        const inDegrees: number[] = [ ...this.#inDegrees ];

        const queue: number[] = [];
        const result: N[] = [];
        inDegrees.forEach((id, index) => {
            if (id === 0) {
                queue.push(index);
            }
        });
        while (queue.length > 0) {
           const currentIndex = queue.shift() as number;
           result.push(this.#indexToNodeMap[currentIndex]);
            for (const neighbour of this.#internal[currentIndex]) {
                if ((--inDegrees[neighbour]) === 0) {
                    queue.push(neighbour);
                }
            }
        }
        if (result.length !== inDegrees.length) {
            throw new CyclicGraphError(this.nodesWithIncomingEdge(inDegrees));
        }
        return result;
    }

    private nodesWithIncomingEdge(inDegrees: number[]): N[] {
        return inDegrees
            .map((id, index) => [id, index])
            .filter(([id]) => id > 0)
            .map(([_, index]) => this.#indexToNodeMap[index])
    }
}
