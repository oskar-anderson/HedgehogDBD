import Point from "./Point";


export default class Table {
    readonly id: string = crypto.randomUUID();
    isHover: boolean = false;
    private isDirty = true;

    
    constructor(
        private position: Point, 
        public head: string, 
        {
            id = crypto.randomUUID(),
            isHover = false
        }
        ) {
        this.id = id;
        this.isHover = isHover;
    }

}