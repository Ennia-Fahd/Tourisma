
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../App.tsx';
import { 
  getPartnerByUserId, 
  getPartnerBookings, 
  updateBookingStatus, 
  EXPERIENCES, 
  CONVERSATIONS, 
  MESSAGES, 
  getUserById, 
  sendMessage, 
  SUPPORT_PARTNER_ID, 
  initializeSupportChat, 
  markMessagesAsRead,
  getPartnerById,
  updateExperience,
  addExperience
} from '../services/mockData.ts';
import { BookingStatus, Experience, UserRole } from '../types.ts';
import { 
  Plus, Calendar, List, Briefcase, TrendingUp, Star, 
  LayoutDashboard, LogOut, Eye, RefreshCcw, ChevronRight, Edit3, X, MessageSquare, Search, Send, BarChart3, Clock, DollarSign, Percent, PieChart as PieIcon, AlertCircle, CheckCircle2, ArrowUpRight, ArrowLeft,
  MapPin, Info, Check, XCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import ExperienceEditModal from '../components/ExperienceEditModal.tsx';
import ExperienceCreateModal from '../components/ExperienceCreateModal.tsx';

interface PartnerDashboardProps {
  isAdminView?: boolean;
  overridePartnerId?: string;
}

const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ isAdminView = false, overridePartnerId }) => {
  const { user, logout, refreshUnread } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [selectedExperienceDetail, setSelectedExperienceDetail] = useState<Experience | null>(null);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const partner = useMemo(() => {
    if (isAdminView && overridePartnerId) return getPartnerById(overridePartnerId);
    return user ? getPartnerByUserId(user.id) : null;
  }, [isAdminView, overridePartnerId, user]);

  const metrics = useMemo(() => {
    if (!partner) return null;
    
    const commissionRate = 15;
    const totalBookings = bookings.length;
    const confirmed = bookings.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED).length;
    const pending = bookings.filter(b => b.status === BookingStatus.PENDING).length;
    const cancelled = bookings.filter(b => b.status === BookingStatus.CANCELLED).length;
    
    const grossRevenue = bookings
      .filter(b => b.status !== BookingStatus.CANCELLED)
      .reduce((acc, curr) => acc + curr.totalPrice, 0);
      
    const commissionAmount = grossRevenue * (commissionRate / 100);
    
    const partnerExps = EXPERIENCES.filter(e => e.partnerId === partner.id);
    const totalViews = partnerExps.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const avgRating = partner.rating || 0;

    return { 
      grossRevenue, 
      commissionAmount, 
      commissionRate,
      totalViews, 
      avgRating,
      totalBookings,
      counts: { confirmed, pending, cancelled },
      statusSplit: [
        { name: 'Confirmée', value: confirmed, color: '#10b981' },
        { name: 'En attente', value: pending, color: '#f59e0b' },
        { name: 'Annulée', value: cancelled, color: '#ef4444' }
      ]
    };
  }, [bookings, partner]);

  const chartData = useMemo(() => [
    { name: 'Sem 1', count: Math.floor(bookings.length * 0.2) },
    { name: 'Sem 2', count: Math.floor(bookings.length * 0.4) },
    { name: 'Sem 3', count: Math.floor(bookings.length * 0.3) },
    { name: 'Sem 4', count: bookings.length },
  ], [bookings.length]);

  const partnerConversations = useMemo(() => {
    if (!partner) return [];
    return CONVERSATIONS.filter(c => c.partnerId === partner.id).map(c => ({
      ...c,
      client: getUserById(c.clientId),
      unread: MESSAGES.filter(m => m.receiverId === (isAdminView ? 'SYSTEM' : user?.id) && m.senderId === c.clientId && !m.read).length
    }));
  }, [partner, refresh, user?.id, isAdminView]);

  const filteredConversations = useMemo(() => {
    return partnerConversations.filter(c => 
      c.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [partnerConversations, searchTerm]);

  const currentMessages = useMemo(() => {
    const conv = partnerConversations.find(c => c.id === selectedConversationId);
    if (!conv || !partner) return [];
    const pUserId = partner.userId;
    return MESSAGES.filter(m => (m.senderId === pUserId && m.receiverId === conv.clientId) || (m.senderId === conv.clientId && m.receiverId === pUserId))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [selectedConversationId, partnerConversations, partner, refresh]);

  useEffect(() => { 
    if (user && !isAdminView) initializeSupportChat(user); 
  }, [user, isAdminView]);

  useEffect(() => { 
    if (partner) setBookings(getPartnerBookings(partner.id)); 
  }, [partner?.id, refresh]);

  useEffect(() => {
    if (activeTab === 'messages' && selectedConversationId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversationId, refresh, activeTab]);

  if (!partner || !metrics) return null;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedExperienceDetail(null);
    setSelectedConversationId(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpdateBooking = (id: string, status: BookingStatus) => {
    updateBookingStatus(id, status);
    setRefresh(r => r + 1);
  };

  const handleSaveExperience = (id: string, updates: Partial<Experience>) => {
    updateExperience(id, updates);
    if (selectedExperienceDetail && selectedExperienceDetail.id === id) {
       setSelectedExperienceDetail(prev => prev ? { ...prev, ...updates } : null);
    }
    setRefresh(r => r + 1);
  };

  const handleCreateExperience = (newExp: Experience) => {
    addExperience(newExp);
    setRefresh(r => r + 1);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const conv = partnerConversations.find(c => c.id === selectedConversationId);
    if (!messageInput.trim() || !conv || !partner) return;
    sendMessage(partner.userId, conv.clientId, messageInput);
    setMessageInput('');
    setRefresh(r => r + 1);
  };

  const tabs = [
    { id: 'overview', label: "Performance", icon: TrendingUp },
    { id: 'bookings', label: 'Mes Ventes', icon: List, badge: metrics.counts.pending },
    { id: 'listings', label: 'Catalogue', icon: Briefcase },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: partnerConversations.reduce((acc, c) => acc + c.unread, 0) },
  ];

  return (
    <div className={`flex h-screen bg-[#fafafa] font-sans overflow-hidden w-full`}>
      {editingExperience && (
        <ExperienceEditModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          experience={editingExperience}
          onSave={handleSaveExperience}
        />
      )}

      {partner && (
        <ExperienceCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateExperience}
          partnerId={partner.id}
        />
      )}

      {/* SIDEBAR */}
      {!isAdminView && (
        <aside className="w-72 bg-white border-r flex flex-col z-50 flex-shrink-0">
          <div className="p-10 flex-1">
             <div className="flex items-center gap-3 mb-16">
                <div className="bg-brand-600 p-2.5 rounded-2xl text-white shadow-xl shadow-brand-200"><LayoutDashboard size={22} /></div>
                <div className="min-w-0">
                  <h2 className="font-black text-sm text-gray-900 truncate">{partner.companyName}</h2>
                  <p className="text-[8px] font-black uppercase text-brand-500 tracking-widest">Partenaire</p>
                </div>
             </div>
             <nav className="space-y-2">
              {tabs.map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => handleTabChange(tab.id)} 
                  className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[#0F172A] text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-4"><tab.icon size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span></div>
                  {tab.badge && activeTab !== tab.id ? <span className="bg-brand-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{tab.badge}</span> : null}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-10 border-t bg-gray-50/50">
            <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 font-black text-[10px] uppercase tracking-widest hover:text-red-700">
              <LogOut size={16}/> Déconnexion
            </button>
          </div>
        </aside>
      )}

      {/* CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-24 bg-white border-b px-12 flex justify-between items-center flex-shrink-0">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                    {tabs.find(t => t.id === activeTab)?.icon && React.createElement(tabs.find(t => t.id === activeTab)!.icon, { size: 18 })}
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dashboard</p>
              </div>
           </div>
           <button onClick={() => setRefresh(r => r + 1)} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-brand-600 border border-gray-100"><RefreshCcw size={16}/></button>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar p-12 lg:p-16">
          <div className="max-w-7xl mx-auto space-y-12 pb-20">
            
            {activeTab === 'overview' && (
              <div className="animate-fade-in space-y-12">
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="p-10 rounded-[3rem] bg-brand-600 text-white shadow-2xl relative overflow-hidden">
                    <DollarSign size={80} className="absolute -right-4 -top-4 opacity-10" />
                    <p className="text-[10px] font-black uppercase text-white/60 mb-1 tracking-widest">CA Brut</p>
                    <h4 className="text-4xl font-black tracking-tighter">{metrics.grossRevenue.toLocaleString()} <span className="text-sm">MAD</span></h4>
                  </div>
                  <div className="p-10 rounded-[3rem] bg-white border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Commission ({metrics.commissionRate}%)</p>
                    <h4 className="text-4xl font-black text-gray-900 tracking-tighter">-{metrics.commissionAmount.toLocaleString()} <span className="text-sm">MAD</span></h4>
                  </div>
                  <div className="p-10 rounded-[3rem] bg-white border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Satisfaction</p>
                    <div className="flex items-center gap-2">
                       <h4 className="text-4xl font-black text-gray-900 tracking-tighter">{metrics.avgRating}</h4>
                       <Star size={20} className="text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>
                  <div className="p-10 rounded-[3rem] bg-white border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Consultations</p>
                    <h4 className="text-4xl font-black text-gray-900 tracking-tighter">{metrics.totalViews}</h4>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                   <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm h-[400px] flex flex-col">
                      <h3 className="font-black text-xl mb-10 flex items-center gap-3"><BarChart3 size={20} className="text-brand-600"/> Évolution Ventes</h3>
                      <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                              <YAxis hide />
                              <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', fontWeight: 900 }} />
                              <Area type="monotone" dataKey="count" stroke="#e11d48" strokeWidth={5} fillOpacity={0.05} fill="#e11d48" />
                           </AreaChart>
                        </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm flex flex-col h-[400px]">
                      <h3 className="font-black text-xl mb-10">Mix Réservations</h3>
                      <div className="flex-1 relative flex items-center justify-center">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                               <Pie data={metrics.statusSplit} innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value">
                                  {metrics.statusSplit.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                               </Pie>
                               <Tooltip />
                            </PieChart>
                         </ResponsiveContainer>
                         <div className="absolute text-center">
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{metrics.totalBookings}</p>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Total</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Activité */}
                <div className="bg-[#0F172A] p-12 lg:p-16 rounded-[4.5rem] text-white shadow-2xl">
                   <h3 className="text-3xl font-black tracking-tighter mb-12">Dernière Activité.</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {bookings.slice(0, 6).map(b => (
                        <div key={b.id} className="bg-white/5 border border-white/10 p-10 rounded-[3rem] flex flex-col gap-6 hover:bg-white hover:text-gray-900 transition-all duration-700">
                           <div className="flex justify-between items-start">
                              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-brand-500 text-xl shadow-inner">
                                 {b.client?.name?.[0] || 'K'}
                              </div>
                              <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10 ${b.status === BookingStatus.CANCELLED ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10'}`}>{b.status}</span>
                           </div>
                           <div className="space-y-1">
                              <h4 className="font-black text-lg truncate uppercase tracking-tight">{b.client?.name}</h4>
                              <p className="text-[10px] font-bold opacity-40 truncate">{b.experienceName}</p>
                           </div>
                           <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                              <div><p className="text-[8px] font-black opacity-20 uppercase mb-1">Montant</p><p className="text-xl font-black">{b.totalPrice} <span className="text-[10px] opacity-40 uppercase">Mad</span></p></div>
                              <div className="text-right"><p className="text-[8px] font-black opacity-20 uppercase mb-1">Date</p><p className="text-[11px] font-black">{b.date}</p></div>
                           </div>
                        </div>
                      ))}
                      {bookings.length === 0 && <div className="col-span-full py-20 text-center opacity-10 uppercase font-black tracking-widest">Aucune donnée</div>}
                   </div>
                </div>
              </div>
            )}

            {/* CATALOGUE (LISTE) */}
            {activeTab === 'listings' && !selectedExperienceDetail && (
              <div className="animate-fade-in space-y-12">
                 <div className="flex justify-between items-center">
                    <h1 className="text-5xl font-black tracking-tighter text-gray-900">Catalogue.</h1>
                    <button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-brand-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-brand-100 hover:scale-105 transition-all"
                    >
                      <Plus size={18}/> Nouvelle Offre
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {EXPERIENCES.filter(e => e.partnerId === partner.id).map(exp => (
                       <div key={exp.id} onClick={() => setSelectedExperienceDetail(exp)} className="bg-white border border-gray-100 rounded-[3.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all group cursor-pointer flex flex-col h-full">
                          <div className="relative h-64 overflow-hidden flex-shrink-0">
                             <img src={exp.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                             <div className="absolute top-6 left-6 bg-white/95 px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-brand-600 shadow-sm">{exp.category}</div>
                          </div>
                          <div className="p-10 flex flex-col flex-1">
                             <h4 className="font-black text-2xl mb-6 leading-tight tracking-tighter flex-1 line-clamp-2">{exp.title}</h4>
                             <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                                <div className="font-black text-2xl text-gray-900 tracking-tighter">{exp.price} <span className="text-xs opacity-20 uppercase">Mad</span></div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase"><Eye size={14}/> {exp.views || 0}</div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            )}

            {/* CATALOGUE (DÉTAILS) */}
            {activeTab === 'listings' && selectedExperienceDetail && (
              <div className="animate-fade-in space-y-12">
                 <button onClick={() => setSelectedExperienceDetail(null)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-600 transition-colors">
                    <ArrowLeft size={16}/> Retour au catalogue
                 </button>
                 
                 <div className="bg-white rounded-[4rem] border border-gray-100 overflow-hidden shadow-sm flex flex-col lg:flex-row h-full lg:h-[600px]">
                    <div className="w-full lg:w-2/5 h-80 lg:h-full relative overflow-hidden">
                       <img src={selectedExperienceDetail.images[0]} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 p-16 flex flex-col justify-between">
                       <div className="space-y-8">
                          <div className="flex justify-between items-start">
                             <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-4 py-1.5 rounded-full mb-4 inline-block">{selectedExperienceDetail.category}</span>
                                <h2 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">{selectedExperienceDetail.title}</h2>
                                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-3 flex items-center gap-2"><MapPin size={12}/> {selectedExperienceDetail.location}</p>
                             </div>
                             <button 
                                onClick={() => { setEditingExperience(selectedExperienceDetail); setIsEditModalOpen(true); }}
                                className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-gray-200"
                             >
                                <Edit3 size={16}/> Modifier l'offre
                             </button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-8 py-10 border-y border-gray-50">
                             <div className="text-center">
                                <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Prix</p>
                                <p className="text-2xl font-black">{selectedExperienceDetail.price} <span className="text-[10px] opacity-30">MAD</span></p>
                             </div>
                             <div className="text-center">
                                <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Vues</p>
                                <p className="text-2xl font-black">{selectedExperienceDetail.views || 0}</p>
                             </div>
                             <div className="text-center">
                                <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Note</p>
                                <p className="text-2xl font-black flex items-center justify-center gap-2">{selectedExperienceDetail.rating} <Star size={16} className="text-yellow-400 fill-yellow-400"/></p>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-4 text-gray-400">
                          <Info size={18}/>
                          <p className="text-[11px] font-medium leading-relaxed">Les modifications apportées au catalogue sont visibles instantanément par les voyageurs sur la plateforme.</p>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* MES VENTES */}
            {activeTab === 'bookings' && (
              <div className="animate-fade-in space-y-12">
                 <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Mes Ventes.</h1>
                 <div className="grid gap-8">
                    {bookings.map(b => (
                      <div key={b.id} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-xl transition-all relative overflow-hidden">
                         <div className="flex items-center gap-8 w-full md:w-auto">
                            <div className="h-20 w-20 bg-brand-50 rounded-[2rem] flex items-center justify-center font-black text-brand-600 text-3xl shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">{b.client?.name?.[0]}</div>
                            <div className="min-w-0">
                               <h4 className="font-black text-2xl text-gray-900 tracking-tighter truncate">{b.client?.name}</h4>
                               <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest truncate">{b.experienceName}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{b.date} • {b.guests} Pers.</p>
                            </div>
                         </div>

                         <div className="flex flex-col md:flex-row items-center gap-10 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right hidden md:block">
                               <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total</p>
                               <p className="text-2xl font-black text-gray-900 tracking-tighter">{b.totalPrice} Mad</p>
                            </div>

                            {b.status === BookingStatus.PENDING ? (
                              <div className="flex items-center gap-4 w-full md:w-auto">
                                <button 
                                  onClick={() => handleUpdateBooking(b.id, BookingStatus.CONFIRMED)}
                                  className="flex-1 md:flex-none bg-green-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                >
                                  <Check size={16}/> Accepter
                                </button>
                                <button 
                                  onClick={() => handleUpdateBooking(b.id, BookingStatus.CANCELLED)}
                                  className="flex-1 md:flex-none bg-gray-100 text-gray-500 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                                >
                                  <XCircle size={16}/> Refuser
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4">
                                 <div className="text-right md:hidden">
                                    <p className="text-xl font-black text-gray-900 tracking-tighter">{b.totalPrice} Mad</p>
                                 </div>
                                 <span className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>{b.status}</span>
                              </div>
                            )}
                         </div>
                      </div>
                    ))}
                    {bookings.length === 0 && <div className="py-20 text-center opacity-10 uppercase font-black tracking-widest">Aucune vente enregistrée</div>}
                 </div>
              </div>
            )}

            {/* MESSAGES */}
            {activeTab === 'messages' && (
              <div className="animate-fade-in h-[calc(100vh-280px)] bg-white border border-gray-100 rounded-[3rem] overflow-hidden flex shadow-sm">
                 <div className="w-80 border-r bg-gray-50 flex flex-col flex-shrink-0">
                    <div className="p-8 border-b bg-white">
                       <h3 className="font-black text-2xl mb-4 tracking-tighter">Messages</h3>
                       <div className="relative">
                          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Chercher..." 
                            className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-10 pr-4 text-[10px] font-black uppercase outline-none shadow-inner" 
                          />
                       </div>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                       {filteredConversations.map(c => (
                         <div key={c.id} onClick={() => setSelectedConversationId(c.id)} className={`p-6 border-b cursor-pointer transition-all ${selectedConversationId === c.id ? 'bg-white border-l-8 border-brand-600' : 'hover:bg-white'}`}>
                            <div className="flex items-center gap-4">
                               <div className="h-12 w-12 rounded-[1rem] bg-brand-50 flex items-center justify-center font-black text-brand-600">{c.client?.name?.[0]}</div>
                               <div className="flex-1 min-w-0">
                                  <h4 className="font-black text-xs uppercase truncate text-gray-900">{c.client?.name}</h4>
                                  <p className="text-[10px] truncate text-gray-400 font-bold">{c.lastMessage}</p>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    {selectedConversationId ? (
                      <>
                        <div className="p-8 border-b bg-white flex items-center gap-4 shadow-sm z-10">
                           <div className="h-14 w-14 rounded-[1.25rem] bg-brand-50 flex items-center justify-center font-black text-brand-600">{partnerConversations.find(c => c.id === selectedConversationId)?.client?.name?.[0]}</div>
                           <h3 className="font-black text-xl tracking-tighter">{partnerConversations.find(c => c.id === selectedConversationId)?.client?.name}</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-gray-50 no-scrollbar">
                           {currentMessages.map(m => (
                             <div key={m.id} className={`flex ${m.senderId === partner.userId ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] px-8 py-5 rounded-[2.5rem] shadow-sm text-sm font-bold ${m.senderId === partner.userId ? 'bg-[#0F172A] text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none'}`}>
                                   {m.content}
                                </div>
                             </div>
                           ))}
                           <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-10 border-t flex gap-5">
                           <input value={messageInput} onChange={e => setMessageInput(e.target.value)} className="flex-1 bg-gray-100 border-none rounded-2xl py-5 px-10 text-[12px] font-bold outline-none shadow-inner" placeholder="Répondre..." />
                           <button type="submit" className="bg-brand-600 text-white p-5 rounded-2xl shadow-xl hover:scale-105" disabled={!messageInput.trim()}><Send size={24}/></button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-10">
                         <MessageSquare size={100} className="mb-6" />
                         <p className="text-xl font-black uppercase tracking-widest">Sélectionnez une discussion</p>
                      </div>
                    )}
                 </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
export default PartnerDashboard;
