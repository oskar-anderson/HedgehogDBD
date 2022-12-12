const app = new PIXI.Application({
    backgroundColor: 0xe6e6e6
});

async function load() {
    app.loader.add('../wwwroot/font/ps2p/consolas-14-xml-white-text-with-alpha-padding0-spacing1.fnt');

    return new Promise((resolve, reject) => {
        app.loader.onComplete.add(() => {
            console.log("app.loader resolve");
            resolve();
        })
        app.loader.onError.add(() => {
            console.log("app.loader onError");
            reject();
        })
        app.loader.load();
    });
}

async function main() {
    await load();
    renderScreen();

    app.renderer.plugins.extract.canvas(app.stage).toBlob((blob) => {
        const a = document.createElement('a');
        document.body.append(a);
        a.download = 'screenshot';
        a.href = URL.createObjectURL(blob);
        a.click();
        a.remove();
    }, 'image/png');
    app.destroy();
}


function renderScreen() {
    let worldCharGridSizeWidth = 463;
    let worldCharGridSizeHeight = 155;
    for (let y = 0; y < worldCharGridSizeHeight; y++) {
        for (let x = 0; x < worldCharGridSizeWidth; x++) {
            let tile = schema.worldDrawArea[y * worldCharGridSizeWidth + x];
            if (tile.char === " ") { continue; }
            let bitmapText = new PIXI.BitmapText(tile.char,
                {
                    fontName: "Consolas",
                    tint: tile.color
                });
            bitmapText.x = x * 7;
            bitmapText.y = y * 14;
            app.stage.addChild(bitmapText);
        }
    }
}

console.log("This could take a while...");
main();