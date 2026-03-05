import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { StoreProvider, useStore } from "./app/store";

import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";

import AdminLayout from "./admin/AdminLayout";
import AdminProducts from "./admin/AdminProducts";
import AdminProductForm from "./admin/AdminProductForm";
import AdminOrders from "./admin/AdminOrders";

function RequireAdmin({ children }) {
  const { user } = useStore();
  const loc = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (!(user.role === "admin" || user.role === "owner")) return <Navigate to="/" replace />;
  return children;
}

function Shell() {
  const location = useLocation(); 
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen">
      <Navbar search={search} onSearchChange={setSearch} />

      {/*  Scroll to top on every route change */}
      <ScrollToTop />

      {/*  Smooth page transitions */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm mode="create" />} />
            <Route path="products/:id" element={<AdminProductForm mode="edit" />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}