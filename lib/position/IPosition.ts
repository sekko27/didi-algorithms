import { IEntity } from "../common/interfaces/IEntity.ts";

export interface IPosition<T extends IEntity> {
    sort(reference: T): [T, T][];
}
