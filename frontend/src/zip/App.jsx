import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CompanyRecords from "./pages/CompanyRecords";
import CompanyPlanes from "./pages/CompanyPlanes";
import CompanyFlights from "./pages/CompanyFlights";
import NotFound from "./pages/NotFound";

function App() {
  const user = JSON.parse(sessionStorage.getItem("user"));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/companies/:id/records" element={user ? <CompanyRecords /> : <Navigate to="/login" />} />
        <Route path="/companies/:id/planes" element={user ? <CompanyPlanes /> : <Navigate to="/login" />} />
        <Route path="/companies/:id/flights" element={user ? <CompanyFlights /> : <Navigate to="/login" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;