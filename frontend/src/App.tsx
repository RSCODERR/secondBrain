import { Routes, Route } from "react-router-dom"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import DashBoard from "./pages/dashboard"
import { SignIn } from "./pages/signIn"
import { Signup } from "./pages/signup"
import LandingPage from "./pages/landingPage"
import ShareView from "./pages/shareview"
import ShareCardView from "./pages/shareCardView"
import Settings from "./pages/settings"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute, PublicOnlyRoute } from "./components/RouteGuards"

function App() {
  return (
    <AuthProvider>
      <Analytics />
      <SpeedInsights />
      <Routes>
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signin"
          element={
            <PublicOnlyRoute>
              <SignIn />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <LandingPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="/share/:shareLink" element={<ShareView />} />
        <Route path="/share/card/:id" element={<ShareCardView />} />
      </Routes>
    </AuthProvider>
  )
}

export default App