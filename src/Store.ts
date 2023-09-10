import { DataBaseSelector } from "./model/DataTypes/DataBaseSelector";
import VmDraw from "./model/viewModel/VmDraw"
import DataBases from "./model/DataTypes/Databases"
import History from "./commands/CommandHistory"
import Databases from "./model/DataTypes/Databases";
import VmRelation from "./model/viewModel/VmRelation";
import VmTable from "./model/viewModel/VmTable";
import { create } from "zustand"
import { persist, createJSONStorage } from 'zustand/middleware'




interface ApplicationState {
    history: {
        undoHistory: string[],
        redoHistory: string[],
    },
    activeDatabaseId: string;
    schemaTables: VmTable[];
    schemaRelations: VmRelation[];

    setTables: (tables: VmTable[]) => void;
    setActiveDatabaseId: (newValue: string) => void;
    setHistory: (newValue: {
        undoHistory: string[],
        redoHistory: string[],
    }) => void;
}

export const useApplicationState = create(
    persist<ApplicationState>(
        (set, get) => ({
            history: {
                undoHistory: [],
                redoHistory: [],
            },
            activeDatabaseId: Databases.Postgres.id,
            schemaTables: [],
            schemaRelations: [],

            setTables: (tables: VmTable[]) => set((state) => (
                { 
                    schemaTables: tables,
                    schemaRelations: tables.flatMap(table => VmTable.GetRelations(table, tables))
                }
            )),
            setActiveDatabaseId: (newValue: string) => set((state) => (
                {
                    activeDatabaseId: newValue
                }
            )),
            setHistory: (newValue: {        
                undoHistory: string[],
                redoHistory: string[]
            }) => set((state) => (
                {
                    history: newValue
                }
            )),
        }),
        {
            name: "HedgehogDBD",
            storage: createJSONStorage(() => localStorage),
        }
    )
);