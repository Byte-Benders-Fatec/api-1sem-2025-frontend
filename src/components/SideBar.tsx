import ApiService from "@/services/ApiService"
import { 
  LayoutDashboard, 
  Settings, 
  LogOut,
  Text,
  UsersRound,
  User,
  Folders,
} from "lucide-react"

const SideBarLayout = () => {
  const logout = () => {
    const apiService = new ApiService();
    const apiEndpoint = "public/auth/logout";

    apiService.get(apiEndpoint)
    localStorage.removeItem(import.meta.env.VITE_AUTH_COOKIE_NAME);
    window.location.href = "/login"
  }

  
  type UserRole = "Admin" | "Colaborador" | null;
  const userRole = localStorage.getItem(import.meta.env.VITE_AUTH_COOKIE_NAME) as UserRole;

  type RoleLinks = {
    [key: string]: { endpoint: string; component: React.ComponentType<{ className?: string }>; name: string }[];
    Admin: { endpoint: string; component: React.ComponentType<{ className?: string }>; name: string }[];
  };
  const roleBtns: RoleLinks = {
    "Admin": [
      {
        "endpoint": "/usuarios",
        "component": User,
        "name": "Usuários"
      },
      {
        "endpoint": "/equipes",
        "component": UsersRound,
        "name": "Equipes"
      },
      {
        "endpoint": "/projetos",
        "component": Folders,
        "name": "Projetos"
      },
    ],
    "Colaborador": []
  }
  return (
    <aside className="bg-white shadow-md lg:w-64 w-20">
  <div className="p-4">
    <h1 className="text-2xl font-bold text-blue-600 hidden lg:block">Byte Benders</h1>
    <h1 className="text-2xl font-bold text-blue-600 lg:hidden">B</h1>
  </div>
  <nav className="mt-8">
    {userRole ? (
      roleBtns[userRole].map((btn, idx) => {
        const ComponentIcon = btn.component;

        return (
          <a
            href={btn.endpoint}
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
            key={idx}
          >
            <ComponentIcon className="h-5 w-5" />
            <span className="ml-3 hidden lg:block">{btn.name}</span>
          </a>
        );
      })
    ) : (
      (window.location.href = "/login")
    )}
  </nav>
  <div className="absolute bottom-0 p-4">
    <a
      href="#"
      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
    >
      <Settings className="h-5 w-5" />
      <span className="ml-3 hidden lg:block">Configurações</span>
    </a>
    <a
      href="#"
      onClick={logout}
      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
    >
      <LogOut className="h-5 w-5" />
      <span className="ml-3 hidden lg:block">Sair</span>
    </a>
  </div>
</aside>

  )
}

export default SideBarLayout;
