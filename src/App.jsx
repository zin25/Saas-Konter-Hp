import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewService from './pages/NewService';
import ServiceList from './pages/ServiceList';
import Customers from './pages/Customers';
import Layout from './components/Layout';
import { db } from './utils/db';

db.initialize();

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Main Application with Navigation Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="new-service" element={<NewService />} />
          <Route path="services" element={<ServiceList />} />
          <Route path="customers" element={<Customers />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
