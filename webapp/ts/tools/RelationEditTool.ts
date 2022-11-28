import { ITool, IToolNames } from "./ITool";

export class RelationEditTool implements ITool {

    constructor() {

    }
    
    getName(): IToolNames {
        return IToolNames.editRelation;
    }

    init(): void {
        throw new Error("Method not implemented.");
    }
    update(): void {
        throw new Error("Method not implemented.");
    }
    exit(): void {
        throw new Error("Method not implemented.");
    }
    getIsDirty(): boolean {
        throw new Error("Method not implemented.");
    }
    
}