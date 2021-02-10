import { Before } from "./Before.ts";
import { IEntity } from "../common/interfaces/IEntity.ts";
import { IGraph } from "../graph/IGraph.ts";
import { IPosition } from "./IPosition.ts";
import { After } from "./After.ts";
import { KahnGraph } from "../sort/topological/KahnGraph.ts";

type IElementByIdProvider<T extends IEntity> = {
    elementById: (id: string) => T;
};

interface ILazyPositionProvider<T extends IEntity> {
    (elementByIdProvider: IElementByIdProvider<T>): IPosition<T>;
}

export class PositionSupport<T extends IEntity> {

    private currentElementId: string | undefined = undefined;
    private readonly elements: Map<string, T> = new Map();
    private readonly positionProviders: Map<string, ILazyPositionProvider<T>[]> = new Map();

    constructor(private readonly graphFactory: () => IGraph<T> = () => new KahnGraph()) {
    }

    elem(elem: T): this {
        this.currentElementId = elem.id;
        this.initElement(elem);
        return this;
    }


    before(elementId: string): this {
        return this.positioning((elementProvider) => new Before(elementProvider.elementById(elementId)));
    }

    after(elementId: string): this {
        return this.positioning((elementProvider) => new After(elementProvider.elementById(elementId)));
    }

    sort(): T[] {
        const graph = this.graphFactory();
        for (const node of this.elements.values()) {
            graph.addNode(node);
        }
        for (const [elementId, providers] of this.positionProviders.entries()) {
            const element: T = this.elementById(elementId);
            for (const provider of providers) {
                for (const [from, to] of provider(this).sort(element)) {
                    graph.addEdge(from, to);
                }
            }
        }
        return graph.sort();
    }
    private positioning(provider: ILazyPositionProvider<T>): this {
        this.ensureCurrentElementId();
        this.initElementPositionProvider(this.currentElementId as string).push(provider);
        return this;

    }
    private ensureCurrentElementId() {
        if (this.currentElementId === undefined) {
            throw new ReferenceError(`No current element is defined`);
        }
    }

    private initElement(elem: T) {
        if (!this.elements.has(elem.id)) {
            this.elements.set(elem.id, elem);
        }
    }

    private initElementPositionProvider(elementId: string): ILazyPositionProvider<T>[] {
        if (!this.positionProviders.has(elementId)) {
            const providers = [] as ILazyPositionProvider<T>[];
            this.positionProviders.set(elementId, providers);
        }
        return this.positionProviders.get(elementId) as ILazyPositionProvider<T>[];
    }

    public elementById(elementId: string): T {
        if (!this.elements.has(elementId)) {
            throw new ReferenceError(`Element not found with id: ${elementId}`);
        }
        return this.elements.get(elementId) as T;
    }

    private static iterate<U extends IEntity>(positionSupport: PositionSupport<U>): [U, ILazyPositionProvider<U>[]][] {
        const result: [U, ILazyPositionProvider<U>[]][] = [];
        for (const [id, element] of positionSupport.elements) {
            const providers = positionSupport.positionProviders.get(id) || [];
            result.push([element, providers]);
        }
        return result;
    }

    public concat(other: PositionSupport<T>): PositionSupport<T> {
        const result = new PositionSupport(this.graphFactory);
        for (const [element, providers] of PositionSupport.iterate(this).concat(PositionSupport.iterate(other))) {
            result.elem(element);
            for (const provider of providers) {
                result.positioning(provider.bind(result));
            }
        }
        return result;
    }

    public static concatReducer<U extends IEntity>(first: PositionSupport<U>, second: PositionSupport<U>): PositionSupport<U> {
        return first.concat(second);
    }
}
