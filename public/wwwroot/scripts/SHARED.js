let SHARED = {

    getSchemaContentFull() {
        let sb = [];
        for (let y = 0; y < schema.worldCharHeight; y++) {
            for (let x = 0; x < schema.worldCharWidth; x++) {
                sb.push(schema.worldDrawArea[y * schema.worldCharWidth + x].char);
            }
            sb.push("\n");
        }
        return sb.join("");
    },

    // cropped version
    getSchemaContent() {
        let sb = [];
        let xMax = 0;
        let xMin = schema.worldCharWidth;
        let yMax = 0;
        let yMin = schema.worldCharHeight;
        for (let y = 0; y < schema.worldCharHeight; y++) {
            for (let x = 0; x < schema.worldCharWidth; x++) {
                let tile = schema.worldDrawArea[y * schema.worldCharWidth + x];
                if (tile.char !== " ") {
                    if (xMax <= x) {
                        xMax = x + 1;
                    }
                    if (yMax <= y) {
                        yMax = y + 1;
                    }
                    if (xMin > x) {
                        xMin = x;
                    }
                    if (yMin > y) {
                        yMin = y;
                    }
                }
            }
        }
        // replace 0 with min value after save format includes extra front matter schema offset data
        for (let y = 0; y < yMax; y++) {
            for (let x = 0; x < xMax; x++) {
                sb.push(schema.worldDrawArea[y * schema.worldCharWidth + x].char);
            }
            sb.push("\n");
        }
        return sb.join("");
    }
    
}
