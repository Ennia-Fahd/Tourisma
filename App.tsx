
import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { USERS, getUnreadMessagesCount } from './services/mockData';
import Home from './pages/Home';
import Search from './pages/Search';
import ExperienceDetails from './pages/ExperienceDetails';
import ClientDashboard from './pages/ClientDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BecomePartner from './pages/BecomePartner';
import { Menu, X, User as UserIcon, LogOut, Globe, ShieldCheck, Briefcase, Compass } from 'lucide-react';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  unreadCount: number;
  refreshUnread: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tourisma_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = () => {
    if (user) setUnreadCount(getUnreadMessagesCount(user.id));
    else setUnreadCount(0);
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('tourisma_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tourisma_user');
    }
    refreshUnread();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(refreshUnread, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const login = (role: UserRole) => {
    const mockUser = USERS.find(u => u.role === role);
    if (mockUser) setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tourisma_user');
    setUnreadCount(0);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, unreadCount, refreshUnread }}>
      {children}
    </AuthContext.Provider>
  );
};

const Navbar = () => {
  const { user, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';
  if (location.pathname.includes('/dashboard')) return null;

  const handleLogin = (role: UserRole) => {
    login(role);
    if (role === UserRole.ADMIN) navigate('/admin/dashboard');
    else if (role === UserRole.PARTNER) navigate('/partner/dashboard');
    else navigate('/'); 
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isHome ? 'bg-transparent text-white pt-4' : 'bg-white/90 backdrop-blur-md text-gray-800 shadow-sm border-b'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-600 shadow-lg"><Globe className="h-6 w-6 text-white" /></div>
            <span className={`text-2xl font-black tracking-tighter ${isHome ? 'text-white' : 'text-gray-900'}`}>Tourisma<span className="text-brand-600">.</span></span>
          </Link>

          <div className="flex items-center gap-6">
            {user?.role === UserRole.CLIENT && (
              <Link to="/" className={`hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-brand-600 transition-colors ${isHome ? 'text-white/80' : 'text-gray-500'}`}>
                <Compass size={16} /> Explorer
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                 <Link 
                    to={user.role === UserRole.ADMIN ? "/admin/dashboard" : user.role === UserRole.PARTNER ? "/partner/dashboard" : "/client/dashboard"} 
                    className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${isHome ? 'border-white/20 hover:bg-white hover:text-gray-900' : 'border-gray-100 hover:bg-gray-50'}`}
                 >
                   Dashboard
                 </Link>
                 <button onClick={handleLogout} className="p-2 text-red-600 hover:scale-110 transition-transform"><LogOut size={20}/></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-900/10 backdrop-blur-md p-1.5 rounded-full border border-white/20">
                <button onClick={() => handleLogin(UserRole.CLIENT)} className="px-4 py-2 text-[8px] font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-gray-900 transition-all">Voyageur</button>
                <button onClick={() => handleLogin(UserRole.PARTNER)} className="px-4 py-2 text-[8px] font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-brand-600 transition-all text-brand-500">Hôte</button>
                <button onClick={() => handleLogin(UserRole.ADMIN)} className="px-4 py-2 text-[8px] font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-gray-900 transition-all text-gray-400">Admin</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/experience/:id" element={<ExperienceDetails />} />
          <Route path="/become-partner" element={<BecomePartner />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/partner/dashboard" element={<PartnerDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
