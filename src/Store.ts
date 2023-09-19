import { DataBaseSelector } from "./model/DataTypes/DataBaseSelector";
import VmDraw from "./model/viewModel/VmDraw"
import DataBases from "./model/DataTypes/Databases"
import History from "./commands/CommandHistory"
import Databases from "./model/DataTypes/Databases";
import VmRelation from "./model/viewModel/VmRelation";
import VmTable from "./model/viewModel/VmTable";
import { create } from "zustand"
import { persist, createJSONStorage } from 'zustand/middleware'
import Script from "./model/Script";




interface ApplicationState {
    history: {
        undoHistory: string[],
        redoHistory: string[],
    },
    activeDatabaseId: string;
    schemaTables: VmTable[];
    schemaRelations: VmRelation[];
    scripts: Script[];
    currentViewport: { x: number, y: number, zoom: number };

    setTables: (tables: VmTable[]) => void;
    setActiveDatabaseId: (newValue: string) => void;
    setHistory: (newValue: {
        undoHistory: string[],
        redoHistory: string[],
    }) => void;
    setScripts: (scripts: Script[]) => void;
    setViewport: (newValue: { x: number, y: number, zoom: number }) => void;
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
            scripts: [],
            currentViewport: { x: 0, y: 0, zoom: 1},

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
            setScripts: (newValue: Script[]) => set((state) => (
                {
                    scripts: newValue,
                }
            )),
            setViewport: (newValue: {x: number, y: number, zoom: number }) => set((state) => (
                {
                    currentViewport: newValue
                }
            )),
        }),
        {
            name: "HedgehogDBD",
            storage: createJSONStorage(() => localStorage),
        }
    )
);