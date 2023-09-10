import Layout from "../components/Layout";
import Databases from "../model/DataTypes/Databases";
import { useApplicationState } from "../Store";
import DataType from "../model/DataTypes/DataType";
import VmTableRowDataTypeArguments from "../model/viewModel/VmTableRowDataTypeArguments";
import History from "../commands/CommandHistory"


export default function Settings() {
    const tables = useApplicationState(state => state.schemaTables);
    const activeDatabaseId = useApplicationState(state => state.activeDatabaseId);
    const setActiveDatabaseId = useApplicationState(state => state.setActiveDatabaseId);
    const setHistory = useApplicationState(state => state.setHistory);
    const handleActiveDatabaseChange = (newActiveDatabaseId: string) => {

        tables.forEach(table => {
            table.tableRows.forEach(tableRow => {
                tableRow.datatype.arguments = tableRow.datatype.arguments
                    .filter(x => x.argument.databases.find(database => database.id === newActiveDatabaseId))  // remove type arguments new database does not need
                    .concat(                                                                    // add type arguements new database needs that are marked readonly
                        DataType.getTypeById(tableRow.datatype.dataTypeId).getAllArguments()
                            .filter(argument => 
                                argument.isReadonly 
                                && argument.databases.find(database => database.id === newActiveDatabaseId)
                            )
                            .map(argument => ({
                                value: argument.defaultValue, 
                                argument: argument
                            }))
                    )
                    .sort((a, b) => a.argument.position - b.argument.position) // sort ascending just in case
            })
        });
        setHistory({
            undoHistory: [],
            redoHistory: [],
        });
        setActiveDatabaseId(newActiveDatabaseId);
    }


    return (
        <>
            <Layout currentlyLoadedLink={"Settings"}>
                <div style={{ width: "660px", margin: "0 auto" }}>
                    <h4 style={{ padding: "1rem", borderBottom: "1px solid #dee2e6" }}>
                        Settings
                    </h4>
                    <div style={{ padding: "1rem" }}>
                        <div className="mb-3" style={{ display: "flex" }}>
                            <div className="fs-5" style={{ flexBasis: "33.33%" }}>
                                Schema properties
                            </div>
                            <div style={{ flexBasis: "66.67%" }}>
                                <div className="semi-bold">
                                    Database
                                </div>
                                <select onChange={(e) => handleActiveDatabaseChange(e.target.value)} defaultValue={activeDatabaseId} className="form-select" >
                                    { 
                                        Databases.getAll().map(x => {
                                            return <option key={x.id} value={x.id}>{x.select}</option> 
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                        <a href="https://github.com/oskar-anderson/HedgehogDBD">Source code</a>
                    </div>
                </div>
            </Layout>
        </>
    );
}