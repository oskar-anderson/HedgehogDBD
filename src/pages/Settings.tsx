import { Modal } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Databases from "../model/DataTypes/Databases";

export default function Settings() {
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
                                <select className="form-select" >
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