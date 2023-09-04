import { DataBaseSelector } from "./model/DataTypes/DataBaseSelector";
import VmDraw from "./model/viewModel/VmDraw"
import DataBases from "./model/DataTypes/Databases"
import History from "./commands/History"

export default class ManagerSingleton {
    private static draw: VmDraw;

    static getDraw() {
        if (!ManagerSingleton.draw) {
            ManagerSingleton.setDraw(
                new VmDraw(
                    new History(), 
                    DataBases.Postgres.id,
                    [],
                    []
                )
            );
        }
        return ManagerSingleton.draw;
    }

    static setDraw(draw: VmDraw) {
        ManagerSingleton.draw = draw;
    }
}