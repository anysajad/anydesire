import { BrowserRouter, Route, Routes } from 'react-router-dom'
import RequireAdmin from './components/RequireAdmin.jsx'
import RequireOwner from './components/RequireOwner.jsx'
import AdminPage from './pages/admin/AdminPage.jsx'
import ContactSettingsPage from './pages/admin/ContactSettingsPage.jsx'
import DevelopersPage from './pages/admin/DevelopersPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import './App.css'
import './public.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/settings" element={<ContactSettingsPage />} />
          <Route element={<RequireOwner />}>
            <Route path="/admin/developers" element={<DevelopersPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
