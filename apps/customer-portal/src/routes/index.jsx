import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login.jsx";
import Home from "../pages/Home/Home.jsx";
import Transactions from "../pages/Transactions/Transactions.jsx";
import NotFound from "../pages/NotFound.jsx";
import AppShell from "../components/layout/AppShell.jsx";
import { isAuthed } from "../lib/auth.js";

function Private({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return children;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Private><AppShell /></Private>}>
          <Route index element={<Home />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
