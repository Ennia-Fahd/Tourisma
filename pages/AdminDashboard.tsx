
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../App';
import { 
  PARTNERS, BOOKINGS, EXPERIENCES, USERS, CONVERSATIONS, MESSAGES, 
  updatePartnerStatus, getPartnerById, getUserById,
  sendMessage, SUPPORT_PARTNER_ID, markMessagesAsRead, updatePartner
} from '../services/mockData';
import { PartnerStatus, BookingStatus, Partner } from '../types';
import { 
  Users, MessageSquare, ShieldCheck, TrendingUp, DollarSign, 
  Search, LayoutDashboard, CheckCircle, Clock, 
  Activity, Zap, RefreshCcw, Star, Wallet, ChevronLeft, MapPin, Send, Eye, Percent, Settings, LogOut, Filter, BarChart3, AlertCircle, Phone, Calendar as CalendarIcon, Edit3
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import PartnerDashboard from './PartnerDashboard.tsx';

// --- VUE GESTION PARTENAIRE (Administration pure) ---
const PartnerAccountManagement = ({ partnerId, onBack }: { partnerId: string, onBack: () => void }) => {
  const [partner, setPartner] = useState(getPartnerById(partnerId));
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Partner>>({});

  useEffect(() => {
    if (partner) setEditForm(partner);
  }, [partner]);
  
  const handleStatusUpdate = (status: PartnerStatus) => {
    const confirmMsg = status === PartnerStatus.SUSPENDU 
      ? "Êtes-vous sûr de vouloir suspendre ce compte ? Le partenaire ne pourra plus recevoir de réservations."
      : "Voulez-vous réactiver ce compte ?";
      
    if (window.confirm(confirmMsg)) {
      updatePartnerStatus(partnerId, status);
      setPartner(getPartnerById(partnerId));
    }
  };

  const handleSaveEdit = () => {
    if (partner) {
      updatePartner(partner.id, editForm);
      setPartner(getPartnerById(partnerId));
      setIsEditing(false);
    }
  };

  if (!partner) return null;

  return (
    <div className="space-y-12 animate-fade-in pb-20">
       <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-600 transition-colors">
            <ChevronLeft size={16}/> Retour à la liste
          </button>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Session Admin Active</span>
          </div>
       </div>
       
       <div className="bg-white rounded-[4rem] border border-gray-100 overflow-hidden shadow-2xl shadow-gray-200/50">
          {/* Banner Dark */}
          <div className="h-64 bg-[#0F172A] relative">
             <div className="absolute -bottom-16 left-16 flex items-end gap-8">
                <div className="w-44 h-44 bg-white rounded-[3.5rem] shadow-2xl flex items-center justify-center text-7xl font-black text-brand-600 border-[12px] border-white select-none">
                  {partner.companyName[0]}
                </div>
                <div className="mb-6">
                   <div className="flex items-center gap-4 mb-2">
                      <h1 className="text-5xl font-black tracking-tighter text-white">{partner.companyName}</h1>
                      <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${partner.status === PartnerStatus.ACTIF ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                         {partner.status}
                      </span>
                   </div>
                   <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.3em]">Partenaire Certifié depuis {partner.joinDate}</p>
                </div>
             </div>
          </div>

          <div className="p-20 pt-32 grid grid-cols-1 lg:grid-cols-2 gap-24">
             {/* Left: General Info - Matches screenshot EXACTLY */}
             <div className="space-y-10">
                <h3 className="text-[18px] font-black tracking-tight text-gray-900 uppercase">Informations Générales</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center p-8 bg-gray-50/30 rounded-[2.5rem] border border-gray-50 group hover:bg-white hover:shadow-xl transition-all duration-500">
                      <div className="flex items-center gap-5">
                         <div className="p-4 bg-white rounded-2xl text-brand-600 shadow-sm border border-gray-50"><MapPin size={22}/></div>
                         <span className="text-gray-400 font-black uppercase text-[11px] tracking-[0.15em]">Ville</span>
                      </div>
                      <span className="font-black text-[18px] text-gray-900">{partner.city}</span>
                   </div>
                   
                   <div className="flex justify-between items-center p-8 bg-gray-50/30 rounded-[2.5rem] border border-gray-50 group hover:bg-white hover:shadow-xl transition-all duration-500">
                      <div className="flex items-center gap-5">
                         <div className="p-4 bg-white rounded-2xl text-brand-600 shadow-sm border border-gray-50"><Phone size={22}/></div>
                         <span className="text-gray-400 font-black uppercase text-[11px] tracking-[0.15em]">Téléphone</span>
                      </div>
                      <span className="font-black text-[18px] text-gray-900">{partner.phone}</span>
                   </div>

                   <div className="flex justify-between items-center p-8 bg-gray-50/30 rounded-[2.5rem] border border-gray-50 group hover:bg-white hover:shadow-xl transition-all duration-500">
                      <div className="flex items-center gap-5">
                         <div className="p-4 bg-white rounded-2xl text-brand-600 shadow-sm border border-gray-50"><CalendarIcon size={22}/></div>
                         <span className="text-gray-400 font-black uppercase text-[11px] tracking-[0.15em]">Membre depuis</span>
                      </div>
                      <span className="font-black text-[18px] text-gray-900">{partner.joinDate}</span>
                   </div>
                </div>
             </div>

             {/* Right: Admin Actions - Matches screenshot EXACTLY */}
             <div className="space-y-10">
                <h3 className="text-[18px] font-black tracking-tight text-gray-900 uppercase">Actions Administratives</h3>
                <div className="space-y-4">
                   {partner.status !== PartnerStatus.SUSPENDU ? (
                     <button 
                        onClick={() => handleStatusUpdate(PartnerStatus.SUSPENDU)} 
                        className="w-full bg-[#FFF1F2] text-brand-600 py-8 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-brand-600 hover:text-white transition-all duration-500 flex items-center justify-center gap-5 shadow-sm"
                     >
                        <div className="p-1 border-2 border-brand-600 rounded-full"><AlertCircle size={20}/></div> Suspendre le compte
                     </button>
                   ) : (
                     <button 
                        onClick={() => handleStatusUpdate(PartnerStatus.ACTIF)} 
                        className="w-full bg-green-50 text-green-600 py-8 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-green-600 hover:text-white transition-all duration-500 flex items-center justify-center gap-5 shadow-sm"
                     >
                        <div className="p-1 border-2 border-green-600 rounded-full"><CheckCircle size={20}/></div> Réactiver le compte
                     </button>
                   )}
                   
                   <button 
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-[#0F172A] text-white py-8 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-black transition-all duration-500 flex items-center justify-center gap-5 shadow-2xl shadow-gray-200"
                   >
                      <Edit3 size={20}/> Modifier les informations
                   </button>

                   <div className="pt-16 space-y-6 flex flex-col items-center">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em] text-center">Dernière activité: Il y a 2 heures</p>
                      <div className="flex justify-center gap-3">
                         <div className="w-14 h-1 bg-gray-100 rounded-full"></div>
                         <div className="w-14 h-1 bg-gray-100 rounded-full"></div>
                         <div className="w-14 h-1 bg-gray-100 rounded-full"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Modal Edition Partner */}
       {isEditing && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
            <div className="bg-white rounded-[3.5rem] p-16 max-w-2xl w-full relative z-10 animate-slide-up shadow-2xl border border-gray-100">
               <h3 className="text-4xl font-black tracking-tighter mb-10">Édition Partenaire.</h3>
               <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Nom de l'entreprise</label>
                    <input 
                      value={editForm.companyName} 
                      onChange={e => setEditForm({...editForm, companyName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] p-5 font-black text-lg outline-none focus:ring-2 focus:ring-brand-500 transition-all" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Ville</label>
                        <input 
                           value={editForm.city} 
                           onChange={e => setEditForm({...editForm, city: e.target.value})}
                           className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] p-5 font-black text-lg outline-none focus:ring-2 focus:ring-brand-500 transition-all" 
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Téléphone</label>
                        <input 
                           value={editForm.phone} 
                           onChange={e => setEditForm({...editForm, phone: e.target.value})}
                           className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] p-5 font-black text-lg outline-none focus:ring-2 focus:ring-brand-500 transition-all" 
                        />
                     </div>
                  </div>
                  <div className="flex gap-4 pt-10">
                     <button onClick={() => setIsEditing(false)} className="flex-1 py-6 bg-gray-100 rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-gray-200 transition-all">Annuler</button>
                     <button onClick={handleSaveEdit} className="flex-[2] py-6 bg-brand-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-xl shadow-brand-100 hover:bg-brand-700 transition-all">Mettre à jour le partenaire</button>
                  </div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

const AdminDashboard = () => {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'messages'>('overview');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'MANAGEMENT' | 'DASHBOARD'>('MANAGEMENT');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [partnerSearch, setPartnerSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<'day' | 'month' | 'year'>('month');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- CALCULS DES KPIs ADMIN ---
  const adminStats = useMemo(() => {
    const activePartners = PARTNERS.filter(p => p.status === PartnerStatus.ACTIF && p.id !== SUPPORT_PARTNER_ID).length;
    const pendingPartners = PARTNERS.filter(p => p.status === PartnerStatus.EN_ATTENTE_VALIDATION).length;
    
    const completedBookings = BOOKINGS.filter(b => b.status === BookingStatus.COMPLETED).length;
    const ongoingBookings = BOOKINGS.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING).length;
    
    // CA Commission (15% de chaque réservation non annulée)
    const totalRevenue = BOOKINGS.filter(b => b.status !== BookingStatus.CANCELLED)
      .reduce((acc, curr) => acc + (curr.totalPrice * 0.15), 0);
    
    const totalPartners = PARTNERS.filter(p => p.id !== SUPPORT_PARTNER_ID).length;
    const avgCommission = totalPartners > 0 ? (15) : 0; // Fixe à 15% selon la logique actuelle

    return { activePartners, pendingPartners, completedBookings, ongoingBookings, totalRevenue, avgCommission };
  }, [refresh]);

  // --- DONNÉES GRAPHE VISITES (Mock) ---
  const visitData = useMemo(() => {
    if (timeFilter === 'day') return [{n: '08h', v: 40}, {n: '12h', v: 120}, {n: '16h', v: 85}, {n: '20h', v: 210}];
    if (timeFilter === 'month') return [{n: 'Sem 1', v: 1200}, {n: 'Sem 2', v: 1800}, {n: 'Sem 3', v: 1500}, {n: 'Sem 4', v: 2400}];
    return [{n: 'Jan', v: 5000}, {n: 'Fév', v: 7500}, {n: 'Mar', v: 12000}, {n: 'Avr', v: 10000}];
  }, [timeFilter]);

  const supportConversations = useMemo(() => {
    return CONVERSATIONS.filter(c => c.partnerId === SUPPORT_PARTNER_ID).map(c => ({
      ...c, 
      client: getUserById(c.clientId), 
      unread: MESSAGES.filter(m => m.receiverId === user?.id && m.senderId === c.clientId && !m.read).length
    }));
  }, [user?.id, refresh]);

  const currentConversation = supportConversations.find(c => c.id === selectedConversationId);
  const currentMessages = useMemo(() => {
    if (!currentConversation || !user) return [];
    return MESSAGES.filter(m => (m.senderId === user.id && m.receiverId === currentConversation.clientId) || (m.senderId === currentConversation.clientId && m.receiverId === user.id))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [currentConversation, user?.id, refresh]);

  const filteredPartners = PARTNERS.filter(p => 
    p.id !== SUPPORT_PARTNER_ID && 
    p.companyName.toLowerCase().includes(partnerSearch.toLowerCase())
  );

  useEffect(() => { 
    if (activeTab === 'messages' && selectedConversationId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversationId, refresh, activeTab]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* SIDEBAR ADMIN */}
      <aside className="w-72 bg-gray-900 text-white flex flex-col flex-shrink-0 z-50">
        <div className="p-10 flex items-center gap-4">
          <div className="bg-brand-600 p-2.5 rounded-2xl shadow-xl shadow-brand-900/20"><ShieldCheck size={24} /></div>
          <h2 className="font-black text-xl tracking-tighter">Tourisma<span className="text-brand-500">.</span></h2>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: 'overview', label: 'Vue Générale', icon: LayoutDashboard },
            { id: 'partners', label: 'Gestion Partenaires', icon: Users },
            { id: 'messages', label: 'Support Client', icon: MessageSquare, badge: unreadCount },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setSelectedPartnerId(null); }} className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>
              <div className="flex items-center gap-4"><tab.icon size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span></div>
              {tab.badge ? <span className="bg-brand-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black">{tab.badge}</span> : null}
            </button>
          ))}
        </nav>
        <div className="p-10 border-t border-white/5 space-y-6">
           <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Administrateur : {user.name}</p>
           <button onClick={handleLogout} className="w-full flex items-center gap-3 text-red-400 font-black text-[10px] uppercase tracking-widest hover:text-red-300 transition-colors">
             <LogOut size={16} /> Déconnexion
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-100 px-10 flex justify-between items-center z-40">
           <div className="flex items-center gap-3"><div className="p-2 bg-brand-50 text-brand-600 rounded-lg"><ShieldCheck size={18}/></div><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Console d'Administration</p></div>
           
           {activeTab === 'overview' && (
             <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
               {['day', 'month', 'year'].map(f => (
                 <button key={f} onClick={() => setTimeFilter(f as any)} className={`px-4 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${timeFilter === f ? 'bg-white shadow-sm text-brand-600' : 'text-gray-400'}`}>
                    {f === 'day' ? 'Jour' : f === 'month' ? 'Mois' : 'Année'}
                 </button>
               ))}
             </div>
           )}
           
           <button onClick={() => setRefresh(r => r + 1)} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors"><RefreshCcw size={16}/></button>
        </header>

        <main className="flex-1 overflow-y-auto p-10 no-scrollbar">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <div className="space-y-10 animate-fade-in">
                {/* Ligne 1: Partenaires */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 group hover:shadow-xl transition-all">
                      <div className="p-3 w-fit rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform"><Users size={20} /></div>
                      <div><p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Partenaires Actifs</p><h4 className="text-3xl font-black text-gray-900 tracking-tighter">{adminStats.activePartners}</h4></div>
                   </div>
                   <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 group hover:shadow-xl transition-all">
                      <div className="p-3 w-fit rounded-2xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform"><Clock size={20} /></div>
                      <div><p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">En attente validation</p><h4 className="text-3xl font-black text-gray-900 tracking-tighter">{adminStats.pendingPartners}</h4></div>
                   </div>
                   <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 group hover:shadow-xl transition-all">
                      <div className="p-3 w-fit rounded-2xl bg-green-50 text-green-600 group-hover:scale-110 transition-transform"><CheckCircle size={20} /></div>
                      <div><p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Réservations Terminées</p><h4 className="text-3xl font-black text-gray-900 tracking-tighter">{adminStats.completedBookings}</h4></div>
                   </div>
                   <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 group hover:shadow-xl transition-all">
                      <div className="p-3 w-fit rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform"><Activity size={20} /></div>
                      <div><p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Réservations en cours</p><h4 className="text-3xl font-black text-gray-900 tracking-tighter">{adminStats.ongoingBookings}</h4></div>
                   </div>
                </div>

                {/* Ligne 2: Finance & Graphe */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm h-[450px] flex flex-col">
                      <div className="flex justify-between items-center mb-10">
                         <h3 className="font-black text-xl flex items-center gap-3"><BarChart3 size={20} className="text-brand-600"/> Visites du Site</h3>
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Données en temps réel</span>
                      </div>
                      <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={visitData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                              <YAxis hide />
                              <Tooltip />
                              <Area type="monotone" dataKey="v" stroke="#e11d48" strokeWidth={5} fillOpacity={0.05} fill="#e11d48" />
                           </AreaChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="bg-brand-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden h-1/2 flex flex-col justify-between">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><DollarSign size={80} /></div>
                         <p className="text-[10px] font-black uppercase text-white/60 tracking-widest">Chiffre d'Affaires (Commissions)</p>
                         <h4 className="text-4xl font-black tracking-tighter">{adminStats.totalRevenue.toLocaleString()} <span className="text-sm">MAD</span></h4>
                      </div>
                      <div className="bg-gray-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden h-1/2 flex flex-col justify-between">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><Percent size={80} /></div>
                         <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Taux de Commission Moyen</p>
                         <h4 className="text-4xl font-black tracking-tighter">{adminStats.avgCommission}%</h4>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'partners' && (
              selectedPartnerId ? (
                viewMode === 'MANAGEMENT' ? (
                  <PartnerAccountManagement partnerId={selectedPartnerId} onBack={() => setSelectedPartnerId(null)} />
                ) : (
                  <div className="animate-fade-in h-[85vh] -m-10">
                     <div className="bg-gray-900 text-white px-10 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                           <button onClick={() => setSelectedPartnerId(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronLeft size={20}/></button>
                           <h3 className="font-black text-xs uppercase tracking-widest">Aperçu Performance : {getPartnerById(selectedPartnerId)?.companyName}</h3>
                        </div>
                        <span className="bg-brand-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Mode Miroir</span>
                     </div>
                     <div className="h-full overflow-y-auto">
                        <PartnerDashboard isAdminView={true} overridePartnerId={selectedPartnerId} />
                     </div>
                  </div>
                )
              ) : (
                <div className="space-y-10 animate-fade-in">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                      <div>
                        <h1 className="text-5xl font-black tracking-tighter">Partenaires.</h1>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Gestion et suivi de la flotte d'hôtes</p>
                      </div>
                      <div className="w-full md:w-96 relative">
                         <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                         <input 
                            value={partnerSearch}
                            onChange={(e) => setPartnerSearch(e.target.value)}
                            placeholder="Rechercher par nom..." 
                            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none shadow-sm focus:ring-2 focus:ring-brand-500 transition-all"
                         />
                      </div>
                   </div>

                   <div className="grid gap-4">
                      {filteredPartners.map(p => (
                         <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-8 hover:shadow-2xl transition-all group">
                            <div className="flex items-center gap-8 flex-1">
                               <div className="h-20 w-20 bg-brand-50 rounded-[2.25rem] flex items-center justify-center font-black text-brand-600 text-3xl shadow-inner group-hover:scale-110 transition-transform">
                                  {p.companyName[0]}
                               </div>
                               <div>
                                  <h3 className="font-black text-2xl tracking-tighter">{p.companyName}</h3>
                                  <div className="flex gap-4 text-[10px] font-black uppercase text-gray-400">
                                     <span className="flex items-center gap-1"><MapPin size={12}/> {p.city}</span>
                                     <span className={`flex items-center gap-1 ${p.status === PartnerStatus.ACTIF ? 'text-green-600' : 'text-amber-600'}`}>
                                        <CheckCircle size={12}/> {p.status}
                                     </span>
                                     <span className="flex items-center gap-1 text-gray-400"><Star size={12}/> {p.rating} / 5</span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex gap-3">
                               <button 
                                 onClick={() => { setSelectedPartnerId(p.id); setViewMode('MANAGEMENT'); }} 
                                 className="bg-gray-100 text-gray-900 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all flex items-center gap-2"
                               >
                                 <Settings size={16}/> Gérer le compte
                               </button>
                               <button 
                                 onClick={() => { setSelectedPartnerId(p.id); setViewMode('DASHBOARD'); }} 
                                 className="bg-brand-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all flex items-center gap-2 shadow-lg shadow-brand-100"
                               >
                                 <TrendingUp size={16}/> Dashboard Performance
                               </button>
                            </div>
                         </div>
                      ))}
                      {filteredPartners.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                           <Search size={40} className="mx-auto text-gray-200 mb-4" />
                           <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Aucun partenaire trouvé</p>
                        </div>
                      )}
                   </div>
                </div>
              )
            )}

            {activeTab === 'messages' && (
              <div className="h-[calc(100vh-220px)] bg-white border border-gray-100 rounded-[3rem] overflow-hidden flex shadow-2xl animate-fade-in">
                  <div className="w-80 border-r border-gray-100 bg-gray-50 flex flex-col">
                     <div className="p-8 border-b bg-white border-gray-100">
                        <h3 className="font-black text-2xl mb-4 tracking-tighter">Support Client</h3>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tickets d'assistance</p>
                     </div>
                     <div className="flex-1 overflow-y-auto no-scrollbar">
                        {supportConversations.map(c => (
                          <div key={c.id} onClick={() => { setSelectedConversationId(c.id); if(user && c.clientId) markMessagesAsRead(user.id, c.clientId); setRefresh(r => r + 1); }} className={`p-7 border-b border-gray-100 cursor-pointer transition-all ${selectedConversationId === c.id ? 'bg-white border-l-4 border-brand-600 shadow-inner' : 'hover:bg-white/60'}`}>
                             <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center font-black text-brand-600 shadow-sm">{c.client?.name[0]}</div>
                                <div className="truncate flex-1">
                                   <div className="flex justify-between items-baseline mb-1">
                                      <h4 className="font-black text-xs uppercase truncate text-gray-900">{c.client?.name}</h4>
                                      {c.unread > 0 && <span className="bg-brand-600 h-2 w-2 rounded-full"></span>}
                                   </div>
                                   <p className="text-[10px] truncate text-gray-400 font-bold">{c.lastMessage}</p>
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="flex-1 flex flex-col bg-white">
                      {selectedConversationId && currentConversation ? (
                         <>
                           <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
                              <div className="flex items-center gap-5">
                                 <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center font-black text-brand-600 shadow-sm">{currentConversation.client?.name[0]}</div>
                                 <div>
                                    <h3 className="font-black text-xl tracking-tighter">{currentConversation.client?.name}</h3>
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Support Technique en ligne</p>
                                 </div>
                              </div>
                           </div>
                           <div className="flex-1 overflow-y-auto p-12 space-y-8 bg-gray-50/20 no-scrollbar">
                              {currentMessages.map(m => (
                                 <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] px-8 py-5 rounded-[2.5rem] text-[13px] font-bold shadow-sm ${m.senderId === user.id ? 'bg-brand-600 text-white shadow-brand-100 rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                                       {m.content}
                                    </div>
                                 </div>
                              ))}
                              <div ref={messagesEndRef} />
                           </div>
                           <form onSubmit={(e) => { e.preventDefault(); if (messageInput.trim()) { sendMessage(user.id, currentConversation.clientId, messageInput); setMessageInput(''); setRefresh(r => r + 1); }}} className="p-10 border-t border-gray-100 bg-white flex gap-5">
                              <input value={messageInput} onChange={e => setMessageInput(e.target.value)} className="flex-1 bg-gray-100 border-none rounded-2xl py-5 px-10 text-[12px] font-bold outline-none shadow-inner" placeholder="Répondre au client..." />
                              <button type="submit" className="bg-brand-600 text-white p-5 rounded-2xl shadow-xl shadow-brand-100 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50" disabled={!messageInput.trim()}><Send size={24}/></button>
                           </form>
                         </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-200 uppercase font-black tracking-widest">
                           <MessageSquare size={120} className="mb-8 opacity-10"/>
                           <p className="text-2xl opacity-10">Centre de support</p>
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
export default AdminDashboard;
