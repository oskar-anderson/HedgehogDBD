import { Manager } from "./Manager";
import { LoaderScene } from "./Scenes/LoaderScene";
import { Draw } from "./model/Draw";

export class Programm {

    static main(draw: Draw): void {
        Manager.initialize(1080, 720, 0xe6e6e6);
        let scene = new LoaderScene(draw);
        Manager.changeScene(scene);
    }
}