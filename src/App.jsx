import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ListPage from "./pages/ListPage";
import AddPage from "./pages/AddPage";
import EditPage from "./pages/EditPage";
import Dashboard from "./pages/Dashboard";
import DetailPage from "./pages/DetailPage";
import ReportPage from "./pages/ReportPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ErrorBoundary from "./components/ErrorBoundary";

const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem("loggedIn");
  return isAuth ? children : <Navigate to="/login" />;
};

function App() {
  console.log("App component is rendering!");
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><ListPage /></ProtectedRoute>} />
            <Route path="/add" element={<ProtectedRoute><AddPage /></ProtectedRoute>} />
            <Route path="/edit" element={<ProtectedRoute><EditPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/detail" element={<ProtectedRoute><DetailPage /></ProtectedRoute>} />
            <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}

export default App;