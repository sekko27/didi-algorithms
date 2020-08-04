import { IEntity } from "../../common/interfaces/IEntity.ts";

export class CyclicGraphError extends Error {
    constructor(readonly nodes: IEntity[]) {
        super(`Graph has cyclic sub-graph (of elements ${nodes.length}): ${nodes.map(n => n.id).join(", ")}`);
    }
}
