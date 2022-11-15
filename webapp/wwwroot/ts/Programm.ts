import { Manager } from "./Manager";
import { LoaderScene } from "./Scenes/LoaderScene";
import { Schema } from "./model/Schema";
import { Draw } from "./model/Draw";

export class Programm {

    static main(draw: Draw): void {
        Manager.initialize(1080, 720, 0xe6e6e6);

        // We no longer need to tell the scene the size because we can ask Manager!
        const loader: LoaderScene = new LoaderScene(draw);
        Manager.changeScene(loader);
    }
}