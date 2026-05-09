import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Lancamentos } from "./pages/Lancamentos";
import { Loja } from "./pages/Loja";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="lojas/:nome" element={<Loja />} />
        <Route path="lancamentos" element={<Lancamentos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
