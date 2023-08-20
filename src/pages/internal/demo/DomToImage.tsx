import { Link } from "react-router-dom/dist/index";
import { useRef } from "react"
/* @ts-ignore types do not work for this library it seems */
import domtoimage from 'demo-dom-to-image--dom-to-image';

export default function DomToImage() {
    const domToImageSource = useRef<HTMLDivElement>(null);

    const downloadDomAsPng = () => {
        const element = domToImageSource.current!;
        const scaleX = element.getBoundingClientRect().width / element.offsetWidth
        domtoimage.toPng(domToImageSource.current!, {
            width: Math.floor(element.getBoundingClientRect().width / scaleX),
            height: Math.floor(element.getBoundingClientRect().height / scaleX)
        })
            .then(function (dataUrl: any) {
                var link = document.createElement('a');
                link.download = 'domToImageDemo.png';
                link.href = dataUrl;
                link.click();
            })
            .catch(function (error: Error) {
                console.error('oops, something went wrong!', error);
            });
    }

    const data = {
        tables: [
            {
                position: {
                    x: 600,
                    y: 300
                },
                title: "person",
                rows: [
                    {
                        name: "id",
                        type: "int"
                    },
                    {
                        name: "firstname",
                        type: "string"
                    },
                    {
                        name: "lastname",
                        type: "string"
                    },
                    {
                        name: "email",
                        type: "string"
                    },
                ]
            },
            {
                position: {
                    x: 900,
                    y: 650
                },
                title: "registrations",
                rows: [
                    {
                        name: "id",
                        type: "int"
                    },
                    {
                        name: "person_id",
                        type: "int"
                    },
                    {
                        name: "service_id",
                        type: "int"
                    },
                    {
                        name: "date",
                        type: "DateTimeOffset"
                    },
                ]
            },
            {
                position: {
                    x: 1200,
                    y: 300
                },
                title: "service",
                rows: [
                    {
                        name: "id",
                        type: "int"
                    },
                    {
                        name: "name",
                        type: "string"
                    }
                ]
            }
        ] 
    }

    return (
        <>
            <Link to="/internal">go back</Link>
            <h1>DomToImage demo</h1>


            <div style={{ width: "100vw", height: "700px", overflow: "scroll" }}>
                <div ref={domToImageSource} className="tables" style={{ minWidth: "4000px", minHeight: "700px", position: "relative", transform: "scale(1.5)" }}>
                    { data.tables.map(table => {
                        return (
                            <div style={{ 
                                left: `${table.position.x}px`, top: `${table.position.y}px`, position: "absolute", 
                                borderRight: "2px solid #e5e7eb", borderBottom: "2px solid #e5e7eb", borderLeft: "2px solid #e5e7eb", borderRadius: "2px", 
                                boxShadow: "box-shadow: var(0 0 #0000), var(0 0 #0000), var(0 0 #0000)", 
                                width: "min-content"
                            }} key={table.title}>
                                <div className="tableHeader" style={{ borderRadius: "4px", borderTop: "4px solid yellow",  backgroundColor: "#eee" }}>
                                    <div className="d-flex px-4">
                                        <div className="w-100 d-flex justify-content" style={{ fontWeight: "bold" }}>{table.title}</div>
                                        <div>
                                            <svg style={{ height: "1rem", color: "#8c8c8c" }} viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" fillRule="evenodd" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: "white", padding: "0 4px" }}>
                                        {
                                            table.rows.map(row => {
                                                return (
                                                    <div key={row.name} className="d-flex" style={{ justifyContent: "space-between" }}>
                                                        <div style={{ paddingRight: "6px" }}>{row.name}</div>
                                                        <div style={{ color: "#b0b8c4" }}>{row.type}</div>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <p>
                The relative div has to be made to match the size of relative children, otherwise the children will get clipped.
                Applying transform.scale and tansform.translate has a similar problem. 
            </p>

            <button className="btn btn-primary" onClick={downloadDomAsPng}>Export to PNG</button>
            
        </>
    )
}
