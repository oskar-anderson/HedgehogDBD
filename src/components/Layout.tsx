import TopToolbarAction from "./TopToolbarAction";


type LayoutProps = {
    currentlyLoadedLink: "Settings" | "Scripting" | "Draw";
    children: React.ReactNode
}


export default function Layout({ currentlyLoadedLink, children } : LayoutProps) {
    return (<>
        <div className="top-menu-action-container">
            <TopToolbarAction currentlyLoadedLink={currentlyLoadedLink} />
        </div>
        {children}
    </>);
}