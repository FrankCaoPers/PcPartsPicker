import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from './pages/Login/login.tsx';
import SignUp from './pages/SignUp/signup.tsx';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <SignUp />
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
]);