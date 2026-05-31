import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from './pages/Login/login.tsx';
import SignUp from './pages/SignUp/signup.tsx';
import Dashboard from './pages/Dashboard/dashboard.tsx';
import ProjectBuilder from './pages/ProjectBuilder/builder.tsx';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },
  {
    path: "/login",
    element: <Login/>
  },
  {
    path: "/signup",
    element: <SignUp/>
  },
  {
    path: "/dashboard",
    element: <Dashboard/>
  },
  {
    path: "/project/:projectId",
    element: <ProjectBuilder/>
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
]);
