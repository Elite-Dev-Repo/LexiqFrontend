import { Routes, Route, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import MainPage from "./pages/MainPage";
import Room from "./pages/Room";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Lexiq",
  url: "https://lexiq.app",
  description:
    "Learn and master vocabulary through real-time multiplayer quiz battles. Challenge friends, track your progress, and expand your word bank.",
  applicationCategory: "GameApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function App() {
  return (
    <AuthProvider>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#ffffff",
            color: "#1e1f22",
            border: "2px solid #1e1f22",
            boxShadow: "3px 3px 0px 0px #1e1f22",
            fontFamily: '"Space Grotesk", sans-serif',
          },
        }}
      />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room/:code"
          element={
            <ProtectedRoute>
              <Room />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
