import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Login from "./routes/Login";
import Users from './routes/Users';
import TeamsPage from './pages/Teams';
import ProjectsPage from './pages/Projects';
import UsersTable from './components/UsersTable';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/usuarios",
    element: <Users />,
    children: [
      {
        path: "",
        element: <UsersTable />
      }
    ]
  },
  {
    path: "/equipes",
    element: <TeamsPage />,
  },
  {
    path: "/projetos",
    element : <ProjectsPage />
  },

  {
    path: "/login",
    element: <Login />,

  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
)
