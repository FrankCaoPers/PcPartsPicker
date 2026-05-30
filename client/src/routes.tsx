// src/routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login/login.tsx';
import SignUp from './pages/SignUp/signup.tsx';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/signup",
    element: <SignUp />
  }
]);