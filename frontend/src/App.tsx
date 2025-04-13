import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "antd";
import Login from "./components/Login";
import Register from "./components/Register";
import MedicineList from "./components/MedicineList";
import AddMedicine from "./components/AddMedicine";
import EditMedicine from "./components/EditMedicine";
import Sales from "./components/Sales";
import Inventory from "./components/Inventory";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";

const { Content } = Layout;

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout style={{ minHeight: "100vh" }}>
          <Navbar />
          <Content style={{ padding: "24px", background: "#f0f2f5" }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/medicines"
                element={
                  <PrivateRoute>
                    <MedicineList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/medicines/add"
                element={
                  <PrivateRoute>
                    <AddMedicine />
                  </PrivateRoute>
                }
              />
              <Route
                path="/medicines/edit/:id"
                element={
                  <PrivateRoute>
                    <EditMedicine />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <PrivateRoute>
                    <Sales />
                  </PrivateRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <PrivateRoute>
                    <Inventory />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
