function getSaveContent(width, height) {
    let sb = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            sb.push(schema.worldDrawArea[y * width + x].char);
        }
        sb.push("\n");
    }
    return sb.join("");
}

function main() {
    navigator.clipboard.writeText(getSaveContent(WORLD_CHAR_WIDTH, WORLD_CHAR_HEIGHT));
}

main();
RESULT_LOG.push("Copied to clipboard!");