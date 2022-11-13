import { Parser } from "./Parser";

export class SchemaTest {
    
    constructor() {

    }

    static async parseTest1() {
        let text = await(await fetch('/webapp/wwwroot/data/SchemaTest1.txt')).text();
        return new Parser().parse(text);
    }


    static main() {
        this.parseTest1();
    }
}