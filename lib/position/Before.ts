import { IEntity } from "../common/interfaces/IEntity.ts";
import { IPosition } from "./IPosition.ts";

export class Before<T extends IEntity> implements IPosition<T> {
    constructor(private readonly node: T) {
    }

    sort(reference: T): [T, T][] {
        return [[reference, this.node]];
    }


}
