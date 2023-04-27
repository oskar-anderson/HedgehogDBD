const app = new PIXI.Application();

async function load() {
    app.loader.add(BASE_URL + '/wwwroot/font/consolas/consolas-24-xml-white-text-with-alpha-padding0-spacing1.fnt');

    return new Promise((resolve, reject) => {
        app.loader.onComplete.add(() => {
            resolve();
        })
        app.loader.onError.add(() => {
            reject();
        })
        app.loader.load();
    });
}

async function main() {
    await load();
    renderScreen();

    const containerSize = app.stage.getBounds();
    const container = new PIXI.Container();

    const background = new PIXI.Graphics();
    background.beginFill(0xFFFFFF);
    background.drawRect(containerSize.x, containerSize.y, containerSize.width, containerSize.height)
    background.endFill();

    container.addChild(background);
    container.addChild(app.stage);
    const img = app.renderer.plugins.extract.image(container);
    const a = document.createElement('a');
    document.body.append(a);
    a.download = `RasterModeler_${dayjs().format('YYYY-MM-DD-HH-mm-ss')}_screenshot.jpg`;
    a.href = img.src;
    a.click();
    a.remove();
    app.destroy();
}


function renderScreen() {
    for (let y = 0; y < schema.worldCharHeight; y++) {
        for (let x = 0; x < schema.worldCharWidth; x++) {
            let tile = schema.worldDrawArea[y * schema.worldCharWidth + x];
            if (tile.char === " ") { continue; }
            let bitmapText = new PIXI.BitmapText(tile.char,
                {
                    fontName: "Consolas",
                    fontSize: 24,
                    tint: tile.color
                });
            bitmapText.x = x * 12;
            bitmapText.y = y * 24;
            app.stage.addChild(bitmapText);
        }
    }
}

await main();
RESULT_LOG.push("Image downloaded!");