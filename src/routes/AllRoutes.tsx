import ProtectedRoute from '@/context/ProtectedRoute'
import DomainErrorPage from '@/pages/DomainErrorPage'
import Index from '@/pages/Index'
import LoginPage from '@/pages/Login'
import LoginSuccess from '@/pages/LoginSuccess'
import NotFound from '@/pages/NotFound'
import { Route, Routes } from 'react-router-dom'

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard/:threadId"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route path="/login-success" element={<LoginSuccess />} />
      <Route path="/unauthorized" element={<DomainErrorPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AllRoutes