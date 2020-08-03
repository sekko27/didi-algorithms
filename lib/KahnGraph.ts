import { IEntity } from "./IEntity.ts";
import { CyclicGraphError } from "./CyclicGraphError.ts";

export class KahnGraph<N extends IEntity> {
    private index: number = -1;
    private readonly nodeIdToIndexMap: Map<string, number> = new Map();
    private readonly indexToNodeMap: N[] = [];
    private readonly inDegrees: number[] = [];
    private readonly internal: Set<number>[] = [];

    private registerNode(node: N): number {
        if (!this.nodeIdToIndexMap.has(node.id)) {
            const index = ++this.index;
            this.nodeIdToIndexMap.set(node.id, index);
            this.indexToNodeMap.push(node);
            this.internal.push(new Set());
            this.inDegrees.push(0);
            return index;
        } else {
            return this.nodeIdToIndexMap.get(node.id) as number;
        }
    }

    public addNode(node: N): this {
        this.registerNode(node);
        return this;
    }

    public addEdge(from: N, to: N): this {
        const fromIndex = this.registerNode(from);
        const toIndex = this.registerNode(to);
        this.internal[fromIndex].add(toIndex);
        this.inDegrees[toIndex]++;
        return this;
    }

    public sort(): N[] {
        // Clone the in-degrees
        const inDegrees: number[] = [ ...this.inDegrees ];

        const queue: Set<number> = new Set();
        const result: N[] = [];
        inDegrees.forEach((id, index) => {
            if (id === 0) {
                queue.add(index);
            }
        });
        while (queue.size > 0) {
            const currentIndex = queue.keys().next().value;
            queue.delete(currentIndex);
            result.push(this.indexToNodeMap[currentIndex]);
            for (const neighbour of this.internal[currentIndex]) {
                if ((--inDegrees[neighbour]) === 0) {
                    queue.add(neighbour);
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
            .map(([_, index]) => this.indexToNodeMap[index])
    }
}
