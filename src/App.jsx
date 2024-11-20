import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider, UserContext } from "./userContext";
import Login from "./components/Login";
import HomePage from "./pages/HomePage";
import MainLayout from "./layouts/MainLayout";
import ProductsPage from "./pages/ProductsPage";
import ReportsPage from "./pages/ReportsPage";
import NotFoundPage from "./pages/NotFoundPage";
import LogoutPage from "./pages/LogoutPage";
import CustomerPage from "./pages/CustomerPage";
import RegisterPage from "./pages/RegisterPage";
import CartTab from "./components/cartTab";
import OrderList from "./components/OrderList";

import PurchaseOrdersPage from "./pages/PurchaseOrdersPage";
import DefectReportsPage from "./pages/DefectReportsPage";

const ProtectedRoute = ({ requiredRole, children }) => {
  const { userRole, isAuthenticated } = useContext(UserContext);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/home" />; 
  }

  return children;
};

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/home" />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route
            path="/"
            element={
              <MainLayout>
                <CartTab />{" "}
              </MainLayout>
            }
          >
            {" "}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Orders"
              element={
                <ProtectedRoute>
                  <OrderList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register"
              element={
                <ProtectedRoute requiredRole="admin">
                  <RegisterPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer"
              element={
                <ProtectedRoute requiredRole="admin">
                  <CustomerPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/purchaseOrders"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PurchaseOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/defectReports"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DefectReportsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
