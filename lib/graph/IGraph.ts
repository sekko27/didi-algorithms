import { IEntity } from "../common/interfaces/IEntity.ts";

export interface IGraph<N extends IEntity> {
    addNode(node: N): this;
    addEdge(from: N, to: N): this;
    sort(): N[];
}
