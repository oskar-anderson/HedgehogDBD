import Draw from "./model/Draw"


export default class ManagerSingleton {
    private static draw: Draw;

    static getDraw() {
        if (!ManagerSingleton.draw) {
            ManagerSingleton.setDraw(new Draw());
        }
        return ManagerSingleton.draw;
    }

    static setDraw(draw: Draw) {
        ManagerSingleton.draw = draw;
    }
}