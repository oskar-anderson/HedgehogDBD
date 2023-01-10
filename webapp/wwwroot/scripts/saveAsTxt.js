function saveAsTxt() {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(SHARED.getSchemaContent()));
    element.setAttribute('download', `RasterModeler_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

saveAsTxt();
RESULT_LOG.push("File downloaded!");