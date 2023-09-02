import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./../components/Layout"


export default function draw() {
    return <>
        <Layout currentlyLoadedLink={"Draw"}>
            Draw
        </Layout>
    </>
}