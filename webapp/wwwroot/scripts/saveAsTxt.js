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

function saveAsTxt(width, height) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(getSaveContent(width, height)));
    element.setAttribute('download', `RasterModeler_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

saveAsTxt(schema.worldCharWidth, schema.worldCharHeight);
RESULT_LOG.push("File downloaded!");