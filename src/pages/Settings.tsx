import Layout from "../components/Layout";
import Databases from "../model/DataTypes/Databases";
import ManagerSingleton from "../ManagerSingleton";
import DataType from "../model/DataTypes/DataType";
import VmTableRowDataTypeArguments from "../model/viewModel/VmTableRowDataTypeArguments";
import History from "../commands/History"


export default function Settings() {
    const draw = ManagerSingleton.getDraw()
    const handleActiveDatabaseChange = (newActiveDatabaseId: string) => {

        draw.schemaTables.forEach(table => {
            table.tableRows.forEach(tableRow => {
                tableRow.datatype.arguments = tableRow.datatype.arguments
                    .filter(x => x.argument.databases.find(database => database.id === newActiveDatabaseId))  // remove type arguments new database does not need
                    .concat(                                                                    // add type arguements new database needs that are marked readonly
                        DataType.getTypeById(tableRow.datatype.dataTypeId).getAllArguments()
                            .filter(argument => 
                                argument.isReadonly 
                                && argument.databases.find(database => database.id === newActiveDatabaseId)
                            )
                            .map(argument => {
                                return new VmTableRowDataTypeArguments(argument.defaultValue, argument)
                            })
                    )
                    .sort((a, b) => a.argument.position - b.argument.position) // sort ascending just in case
            })
        });
        draw.history = new History();
        draw.activeDatabaseId = newActiveDatabaseId;
    }


    return (
        <>
            <Layout currentlyLoadedLink={"Settings"}>
                <div style={{ width: "660px", margin: "0 auto" }}>
                    <h4 style={{ padding: "1rem", borderBottom: "1px solid #dee2e6" }}>
                        Settings
                    </h4>
                    <div style={{ padding: "1rem" }}>
                        <div style={{ display: "flex" }}>
                            <div className="fs-5" style={{ flexBasis: "33.33%" }}>
                                Schema properties
                            </div>
                            <div style={{ flexBasis: "66.67%" }}>
                                <div className="semi-bold">
                                    Database
                                </div>
                                <select onChange={(e) => handleActiveDatabaseChange(e.target.value)} defaultValue={draw.activeDatabaseId} className="form-select" >
                                    { 
                                        Databases.getAll().map(x => {
                                            return <option key={x.id} value={x.id}>{x.select}</option> 
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}