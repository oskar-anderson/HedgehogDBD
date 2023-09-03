import Point from "./Point";
import Relation from "./Relation";

export default class Table {
    readonly id: string = crypto.randomUUID();
    isHover: boolean = false;
    private isDirty = true;

    
    constructor(
        public position: Point, 
        public head: string,
        public relations: Relation[], 
        {
            id = crypto.randomUUID(),
            isHover = false,
        }
        ) {
        this.id = id;
        this.isHover = isHover;
    }

}