import { DataBaseSelector } from "./model/DataTypes/DataBaseSelector";
import VmDraw from "./model/viewModel/VmDraw"
import DataBases from "./model/DataTypes/Databases"
import History from "./commands/History"
import Databases from "./model/DataTypes/Databases";
import VmRelation from "./model/viewModel/VmRelation";
import VmTable from "./model/viewModel/VmTable";
import { create } from "zustand"
import { persist, createJSONStorage } from 'zustand/middleware'




interface ApplicationState {
    history: History,
    activeDatabaseId: string;
    schemaTables: VmTable[];
    schemaRelations: VmRelation[];
    areTablesDirty: boolean;
}

const initialState = {
    history: new History(),
    activeDatabaseId: Databases.Postgres.id,
    schemaTables: [],
    schemaRelations: [],
    areTablesDirty: true,
}

export const useApplicationState = create(
    persist<ApplicationState>(
        (set, get) => ({
            ...initialState,
            setTables: (tables: VmTable[]) => set((state) => ({ schemaTables: tables }))
        }),
        {
            name: "HedgehogDBD",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);


export default class ManagerSingleton {
    private static draw: VmDraw;

    static getDraw() {
        if (!ManagerSingleton.draw) {
            ManagerSingleton.setDraw(
                new VmDraw(
                    new History(), 
                    DataBases.Postgres.id,
                    [],
                    [],
                    true
                )
            );
        }
        return ManagerSingleton.draw;
    }

    static setDraw(draw: VmDraw) {
        ManagerSingleton.draw = draw;
    }
}