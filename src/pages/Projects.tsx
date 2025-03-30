import SideBarLayout from "@/components/SideBar";
import ProjectsTable from "@/components/ProjectsTable";

const ProjectsPage = () => {
    return (
        <div className="flex h-screen bg-gray-100">

            <SideBarLayout />

            <main className="flex-1 p-8 overflow-auto">
                <ProjectsTable />
            </main>

        </div>
    );
};

export default ProjectsPage;