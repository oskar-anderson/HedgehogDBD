let SHARED = {

    getSchemaContent() {
        let sb = [];
        for (let y = 0; y < schema.worldCharHeight; y++) {
            for (let x = 0; x < schema.worldCharWidth; x++) {
                sb.push(schema.worldDrawArea[y * schema.worldCharWidth + x].char);
            }
            sb.push("\n");
        }
        return sb.join("");
    }
    
}
