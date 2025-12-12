import React, { useState, createContext, useContext, ReactNode } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { User, UserRole } from './types';
import { USERS } from './services/mockData';
import Home from './pages/Home';
import Search from './pages/Search';
import ExperienceDetails from './pages/ExperienceDetails';
import ClientDashboard from './pages/ClientDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BecomePartner from './pages/BecomePartner';
import { Menu, X, User as UserIcon, LogOut, MapPin, Globe } from 'lucide-react';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    // Simulate login by picking a user from mock data based on role
    const mockUser = USERS.find(u => u.role === role);
    if (mockUser) setUser(mockUser);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Navbar Component ---
const Navbar = () => {
  const { user, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isHome && !isMenuOpen ? 'bg-transparent text-white' : 'bg-white text-gray-800 shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isHome && !isMenuOpen ? 'bg-white/20' : 'bg-brand-50'}`}>
              <Globe className={`h-6 w-6 ${isHome && !isMenuOpen ? 'text-white' : 'text-brand-600'}`} />
            </div>
            <span className={`text-xl font-bold tracking-tight ${isHome && !isMenuOpen ? 'text-white' : 'text-brand-600'}`}>
              Tourisma
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/search" className="font-medium hover:text-brand-500 transition">Expériences</Link>
            {!user && <Link to="/become-partner" className="font-medium hover:text-brand-500 transition">Devenir Partenaire</Link>}
            
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 font-medium focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                    {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="h-8 w-8 rounded-full"/> : <UserIcon size={18} />}
                  </div>
                  <span>{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                  {user.role === UserRole.CLIENT && <Link to="/client/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mon Espace</Link>}
                  {user.role === UserRole.PARTNER && <Link to="/partner/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Espace Partenaire</Link>}
                  {user.role === UserRole.ADMIN && <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Administration</Link>}
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2">
                    <LogOut size={14} /> Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* Role Switcher for Demo Purposes */}
                <div className="flex bg-gray-100 text-gray-900 rounded-full p-1">
                  <button onClick={() => login(UserRole.CLIENT)} className="px-3 py-1 text-xs font-medium rounded-full hover:bg-white hover:shadow-sm transition-colors">Client</button>
                  <button onClick={() => login(UserRole.PARTNER)} className="px-3 py-1 text-xs font-medium rounded-full hover:bg-white hover:shadow-sm transition-colors">Partenaire</button>
                  <button onClick={() => login(UserRole.ADMIN)} className="px-3 py-1 text-xs font-medium rounded-full hover:bg-white hover:shadow-sm transition-colors">Admin</button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-20 left-0 w-full p-4 flex flex-col gap-4 text-gray-800 border-t">
          <Link to="/search" className="font-medium" onClick={() => setIsMenuOpen(false)}>Expériences</Link>
          <Link to="/become-partner" className="font-medium" onClick={() => setIsMenuOpen(false)}>Devenir Partenaire</Link>
          {!user ? (
            <div className="flex flex-col gap-2 mt-4 border-t pt-4">
              <span className="text-xs text-gray-500 uppercase">Démo Login</span>
              <button onClick={() => { login(UserRole.CLIENT); setIsMenuOpen(false); }} className="text-left py-2 px-3 bg-gray-50 rounded">Connexion Client</button>
              <button onClick={() => { login(UserRole.PARTNER); setIsMenuOpen(false); }} className="text-left py-2 px-3 bg-gray-50 rounded">Connexion Partenaire</button>
              <button onClick={() => { login(UserRole.ADMIN); setIsMenuOpen(false); }} className="text-left py-2 px-3 bg-gray-50 rounded">Connexion Admin</button>
            </div>
          ) : (
             <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-left py-2 text-red-600 font-medium">Déconnexion</button>
          )}
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Globe className="h-5 w-5 text-brand-500" /> Tourisma</h3>
        <p className="text-gray-400 text-sm">Votre passerelle vers des expériences marocaines authentiques. Basé à Marrakech.</p>
      </div>
      <div>
        <h4 className="font-semibold mb-4">Découvrir</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><a href="#" className="hover:text-brand-500">Aventure</a></li>
          <li><a href="#" className="hover:text-brand-500">Culture</a></li>
          <li><a href="#" className="hover:text-brand-500">Gastronomie</a></li>
          <li><a href="#" className="hover:text-brand-500">Désert</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-4">Partenaires</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><Link to="/become-partner" className="hover:text-brand-500">S'inscrire</Link></li>
          <li><a href="#" className="hover:text-brand-500">Espace Pro</a></li>
          <li><a href="#" className="hover:text-brand-500">Conditions</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-4">Support</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><a href="#" className="hover:text-brand-500">Centre d'aide</a></li>
          <li><a href="#" className="hover:text-brand-500">Sécurité</a></li>
          <li><a href="#" className="hover:text-brand-500">Contact</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
      &copy; 2024 Tourisma. Tous droits réservés.
    </div>
  </footer>
);

// --- Layout Wrapper ---
const Layout = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const ProtectedRoute = ({ children, requiredRole }: { children?: ReactNode, requiredRole?: UserRole }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;

  return <>{children}</>;
};

// --- App Component ---
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/experience/:id" element={<ExperienceDetails />} />
            <Route path="/become-partner" element={<BecomePartner />} />
            
            <Route path="/client/dashboard" element={
              <ProtectedRoute requiredRole={UserRole.CLIENT}>
                <ClientDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/partner/dashboard" element={
              <ProtectedRoute requiredRole={UserRole.PARTNER}>
                <PartnerDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}