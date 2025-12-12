import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { getPartnerByUserId, getPartnerBookings, updateBookingStatus, EXPERIENCES, CONVERSATIONS, MESSAGES, getUserById, sendMessage, SUPPORT_PARTNER_ID, getPartnerById, addExperience, initializeSupportChat } from '../services/mockData';
import { BookingStatus, PartnerStatus, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Check, X, Plus, Calendar, Settings, DollarSign, Clock, MessageSquare, Phone, Mail, Filter, Search, Send, User, LifeBuoy, Image, MapPin, List, AlertTriangle, ExternalLink, Briefcase, CheckCircle } from 'lucide-react';
import CalendarView from '../components/CalendarView';
import ProfileModal from '../components/ProfileModal';
import { useLocation } from 'react-router-dom';

const PartnerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>('ALL');
  const [bookings, setBookings] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newExperience, setNewExperience] = useState({
    title: '', category: 'Aventure', description: '', price: '', duration: '', location: '', maxGuests: 10, included: '', image1: '', image2: ''
  });

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [refresh, setRefresh] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileType, setProfileType] = useState<'CLIENT' | 'PARTNER'>('CLIENT');
  
  // Search state for messages
  const [searchTerm, setSearchTerm] = useState('');
  
  // Handling "Contact Partner" from Experience Details
  const [startChatPartnerId, setStartChatPartnerId] = useState<string | null>(null);

  const partner = user ? getPartnerByUserId(user.id) : null;

  // Initialize automated support chat
  useEffect(() => {
     if (user) {
         initializeSupportChat(user);
         setRefresh(prev => prev + 1);
     }
  }, [user]);

  // Handle incoming location state (navigation from ExperienceDetails)
  useEffect(() => {
    if (location.state) {
        if (location.state.activeTab) setActiveTab(location.state.activeTab);
        if (location.state.startConversationWith) {
             setStartChatPartnerId(location.state.startConversationWith);
             setActiveTab('messages');
        }
        if (location.state.defaultMessage) setMessageInput(location.state.defaultMessage);
    }
  }, [location]);

  useEffect(() => {
    if (partner) {
      setBookings(getPartnerBookings(partner.id));
    }
  }, [partner]);

  useEffect(() => {
    if (activeTab === 'messages' && selectedConversationId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, selectedConversationId, refresh, messageInput]);

  if (!user) return null;
  if (!partner) return <div className="p-10">Erreur: Profil partenaire non trouvé.</div>;
  
  // Handle Suspended Status
  if (partner.status === PartnerStatus.SUSPENDU) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <AlertTriangle size={48} className="text-red-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-red-700">Compte Suspendu</h1>
        <p className="text-gray-600 max-w-md mb-6">
          Votre compte partenaire a été suspendu par l'administration. Vos annonces ne sont plus visibles sur la plateforme.
        </p>
        <div className="bg-white p-4 rounded-lg border shadow-sm max-w-md w-full text-left">
           <h3 className="font-bold mb-2">Que faire ?</h3>
           <p className="text-sm text-gray-500 mb-4">Veuillez contacter le support pour régulariser votre situation ou obtenir plus d'informations.</p>
           <button className="w-full bg-brand-600 text-white py-2 rounded-lg font-bold hover:bg-brand-700">Contacter le Support</button>
        </div>
      </div>
    );
  }
  
  if (partner.status === PartnerStatus.EN_ATTENTE_VALIDATION) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <div className="bg-yellow-100 p-4 rounded-full mb-4">
          <Clock size={48} className="text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Compte en attente de validation</h1>
        <p className="text-gray-600 max-w-md">
          Merci de votre inscription. L'équipe Tourisma examine actuellement votre dossier. 
          Vous recevrez un email dès que votre compte sera activé.
        </p>
      </div>
    );
  }

  // Rest of the dashboard logic
  const myExperiences = EXPERIENCES.filter(e => e.partnerId === partner.id);
  const filteredBookings = filterStatus === 'ALL' ? bookings : bookings.filter(b => b.status === filterStatus);
  const totalRevenue = bookings.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED).reduce((acc, curr) => acc + curr.totalPrice, 0);
  const commission = totalRevenue * 0.15; 
  const netRevenue = totalRevenue - commission;
  const data = [{ name: 'Lun', bookings: 2 }, { name: 'Mar', bookings: 1 }, { name: 'Mer', bookings: 3 }, { name: 'Jeu', bookings: 2 }, { name: 'Ven', bookings: 4 }, { name: 'Sam', bookings: 6 }, { name: 'Dim', bookings: 5 }];

  const handleStatusUpdate = (bookingId: string, status: BookingStatus) => {
    updateBookingStatus(bookingId, status);
    if (partner) setBookings(getPartnerBookings(partner.id));
  };

  const handleCreateExperience = (e: React.FormEvent) => {
    e.preventDefault();
    const includedItems = newExperience.included.split(',').map(item => item.trim()).filter(i => i);
    const images = [newExperience.image1 || 'https://images.unsplash.com/photo-1549488346-601267b2d556', newExperience.image2 || 'https://images.unsplash.com/photo-1536236688223-2895f54366fb'];
    const exp = { id: `e${Date.now()}`, partnerId: partner.id, title: newExperience.title, category: newExperience.category, description: newExperience.description, price: parseInt(newExperience.price) || 0, duration: newExperience.duration, location: newExperience.location, images: images, maxGuests: newExperience.maxGuests, rating: 5.0, reviewsCount: 0, isActive: true, included: includedItems };
    addExperience(exp);
    setIsCreating(false);
    setNewExperience({ title: '', category: 'Aventure', description: '', price: '', duration: '', location: '', maxGuests: 10, included: '', image1: '', image2: '' });
    alert("Expérience créée avec succès !");
  };
  
  const openProfile = (data: any, type: 'CLIENT' | 'PARTNER') => {
      setProfileData(data);
      setProfileType(type);
      setProfileModalOpen(true);
  };

  // Helper to resolve who the partner is talking to
  const resolveChatPartner = (c: any) => {
      if (c.partnerId === SUPPORT_PARTNER_ID) {
          return {
              type: 'SUPPORT',
              name: 'Service Technique',
              role: 'Support',
              avatar: null,
              data: { companyName: 'Service Technique', email: 'support@tourisma.ma', phone: '+212 500 000 000' }
          };
      }
      
      // If I am the Client in this conversation (contacting another partner)
      if (c.clientId === user.id) {
           const p = getPartnerById(c.partnerId);
           return {
               type: 'PARTNER',
               name: p?.companyName || 'Partenaire',
               role: 'Partenaire',
               avatar: null, // Could use company logo
               data: p
           };
      }

      // Default: I am the Partner, other is Client
      const client = getUserById(c.clientId);
      return {
          type: 'CLIENT',
          name: client?.name || 'Client',
          role: 'Client',
          avatar: client?.avatarUrl,
          data: client
      };
  };

  // Prepare conversations
  const displayConversations = CONVERSATIONS.filter(c => 
      c.partnerId === partner.id || 
      (c.clientId === user.id) // Include where I am acting as client
  ).map(c => ({ ...c, isVirtual: false }));

  const hasSupport = displayConversations.some(c => c.partnerId === SUPPORT_PARTNER_ID);
  
  // Handle creating a new virtual conversation if startChatPartnerId is set but not in list
  if (startChatPartnerId) {
      const exists = displayConversations.find(c => c.partnerId === startChatPartnerId && c.clientId === user.id);
      if (!exists) {
           const p = getPartnerById(startChatPartnerId);
           if (p) {
               displayConversations.unshift({
                   id: `new_${startChatPartnerId}`,
                   partnerId: startChatPartnerId,
                   clientId: user.id,
                   lastMessage: 'Démarrer la discussion',
                   lastMessageDate: '',
                   isVirtual: true
               } as any);
           }
      }
  }

  // Auto-select conversation
  useEffect(() => {
     if (startChatPartnerId && !selectedConversationId) {
         const targetId = displayConversations.find(c => c.partnerId === startChatPartnerId && c.clientId === user.id)?.id;
         if (targetId) setSelectedConversationId(targetId);
     }
  }, [startChatPartnerId, displayConversations, selectedConversationId]);

  // Filter conversations for search
  const filteredConversations = displayConversations.filter(c => {
      const chatPartner = resolveChatPartner(c);
      return chatPartner.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Current conversation logic
  const currentConversation = displayConversations.find(c => c.id === selectedConversationId);
  const currentChatPartner = currentConversation ? resolveChatPartner(currentConversation) : null;
  
  // Identify the OTHER person ID for filtering messages
  let otherPersonId = '';
  if (currentConversation) {
      if (currentConversation.partnerId === SUPPORT_PARTNER_ID) {
          const p = getPartnerById(SUPPORT_PARTNER_ID);
          if (p) otherPersonId = p.userId;
      } else if (currentConversation.clientId === user.id) {
          // I am client, other is partner
           const p = getPartnerById(currentConversation.partnerId);
           if (p) otherPersonId = p.userId;
      } else {
          // I am partner, other is client
          // Client ID in conversation struct IS the user ID for clients
          otherPersonId = currentConversation.clientId;
      }
  }

  const currentMessages = (!currentConversation?.isVirtual && otherPersonId) ? MESSAGES.filter(m => (m.senderId === user.id && m.receiverId === otherPersonId) || (m.senderId === otherPersonId && m.receiverId === user.id)).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversationId || !otherPersonId) return;

    const result = sendMessage(user.id, otherPersonId, messageInput);
    if (result && currentConversation?.isVirtual) setSelectedConversationId(result.id);
    
    setMessageInput('');
    setRefresh(prev => prev + 1);
  };

  const startSupportChat = () => {
    const existingConv = displayConversations.find(c => c.partnerId === SUPPORT_PARTNER_ID);
    if (existingConv) setSelectedConversationId(existingConv.id);
    setActiveTab('messages');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ProfileModal 
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        type={profileType}
        data={profileData}
      />
      
      <aside className="w-64 bg-white border-r hidden md:block fixed h-full z-10">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900">{partner.companyName}</h2>
          <p className="text-xs text-green-600 font-medium uppercase mt-1 flex items-center gap-1"><CheckCircle size={10} /> Compte Vérifié</p>
        </div>
        <nav className="mt-4">
          <button onClick={() => {setActiveTab('overview'); setIsCreating(false);}} className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-brand-50 text-brand-600 border-r-2 border-brand-600' : 'text-gray-600 hover:bg-gray-50'}`}>Vue d'ensemble</button>
          <button onClick={() => {setActiveTab('calendar'); setIsCreating(false);}} className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'calendar' ? 'bg-brand-50 text-brand-600 border-r-2 border-brand-600' : 'text-gray-600 hover:bg-gray-50'}`}>Calendrier</button>
          <button onClick={() => {setActiveTab('bookings'); setIsCreating(false);}} className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'bg-brand-50 text-brand-600 border-r-2 border-brand-600' : 'text-gray-600 hover:bg-gray-50'}`}>Réservations</button>
          <button onClick={() => {setActiveTab('listings'); setIsCreating(false);}} className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'listings' ? 'bg-brand-50 text-brand-600 border-r-2 border-brand-600' : 'text-gray-600 hover:bg-gray-50'}`}>Mes Expériences</button>
          <button onClick={() => {setActiveTab('messages'); setIsCreating(false);}} className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-brand-50 text-brand-600 border-r-2 border-brand-600' : 'text-gray-600 hover:bg-gray-50'}`}>Messagerie</button>
        </nav>
      </aside>
      
      <main className="flex-1 p-8 md:ml-64 min-h-screen flex flex-col">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Tableau de bord</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border"><div className="text-gray-500 text-sm mb-1">Chiffre d'affaires Brut</div><div className="text-2xl font-bold">{totalRevenue} MAD</div></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border"><div className="text-gray-500 text-sm mb-1">Commission (15%)</div><div className="text-2xl font-bold text-red-500">-{commission} MAD</div></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border"><div className="text-gray-500 text-sm mb-1">Net à percevoir</div><div className="text-2xl font-bold text-green-600">{netRevenue} MAD</div></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border"><h3 className="font-bold mb-4">Réservations cette semaine</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="bookings" fill="#e11d48" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
          </div>
        )}
        
        {activeTab === 'calendar' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Calendrier des réservations</h1></div>
             <CalendarView bookings={bookings} role={UserRole.PARTNER} onViewProfile={openProfile} />
          </div>
        )}
        
        {activeTab === 'bookings' && (
          <div>
            <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold">Gestion des réservations</h1></div>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button onClick={() => setFilterStatus('ALL')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'ALL' ? 'bg-gray-900 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>Tout ({bookings.length})</button>
              <button onClick={() => setFilterStatus(BookingStatus.PENDING)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === BookingStatus.PENDING ? 'bg-yellow-500 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>En attente ({bookings.filter(b => b.status === BookingStatus.PENDING).length})</button>
              <button onClick={() => setFilterStatus(BookingStatus.CONFIRMED)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === BookingStatus.CONFIRMED ? 'bg-green-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>Confirmées ({bookings.filter(b => b.status === BookingStatus.CONFIRMED).length})</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b"><tr><th className="p-4 text-xs font-bold text-gray-500 uppercase">Client</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Expérience</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Date & Heure</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Prix Total</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Statut</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Actions</th></tr></thead>
                <tbody className="divide-y">{filteredBookings.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <button 
                            onClick={() => openProfile(b.client, 'CLIENT')}
                            className="text-left group"
                        >
                            <div className="font-medium text-gray-900 group-hover:text-brand-600 transition-colors flex items-center gap-2">
                                {b.client?.name}
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                            </div>
                            <div className="text-xs text-gray-500">{b.guests} pers.</div>
                        </button>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{b.experienceName}</td>
                      <td className="p-4 text-sm"><div className="font-medium">{b.date}</div><div className="text-xs text-gray-500">{b.time || 'N/A'}</div></td>
                      <td className="p-4 font-medium">{b.totalPrice} MAD</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${b.status === BookingStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : ''} ${b.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-800' : ''} ${b.status === BookingStatus.CANCELLED ? 'bg-red-100 text-red-800' : ''} ${b.status === BookingStatus.COMPLETED ? 'bg-gray-100 text-gray-800' : ''}`}>{b.status === BookingStatus.PENDING ? 'En attente' : b.status}</span></td>
                      <td className="p-4">
                        {b.status === BookingStatus.PENDING && (<div className="flex gap-2"><button onClick={() => handleStatusUpdate(b.id, BookingStatus.CONFIRMED)} className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"><Check size={16}/></button><button onClick={() => handleStatusUpdate(b.id, BookingStatus.CANCELLED)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"><X size={16}/></button></div>)}
                        {b.status === BookingStatus.CONFIRMED && (<button onClick={() => handleStatusUpdate(b.id, BookingStatus.COMPLETED)} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200">Terminer</button>)}
                      </td>
                    </tr>
                  ))}</tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'listings' && (
           <div>
             <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold">{isCreating ? 'Nouvelle Expérience' : 'Mes Expériences'}</h1>{!isCreating ? <button onClick={() => setIsCreating(true)} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-brand-700 transition"><Plus size={18} /> Créer une expérience</button> : <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-gray-700 px-4 py-2 font-medium">Annuler</button>}</div>
             {isCreating ? <div className="bg-white border rounded-xl p-8 max-w-3xl"><form onSubmit={handleCreateExperience} className="space-y-6"><div><label className="block text-sm font-bold text-gray-700 mb-1">Titre</label><input type="text" required className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-500" value={newExperience.title} onChange={e => setNewExperience({...newExperience, title: e.target.value})} /></div><div className="flex justify-end gap-3 pt-4 border-t"><button type="submit" className="px-6 py-2 rounded-lg bg-brand-600 text-white font-bold">Publier</button></div></form></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{myExperiences.map(exp => (<div key={exp.id} className="bg-white border rounded-xl overflow-hidden shadow-sm flex"><img src={exp.images[0]} className="w-32 object-cover" /><div className="p-4 flex-1"><h3 className="font-bold text-gray-900 line-clamp-1">{exp.title}</h3><div className="text-xs text-gray-500 mt-2">{exp.price} MAD</div></div></div>))}</div>}
           </div>
        )}
        
        {activeTab === 'messages' && (
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm flex flex-1 max-h-[calc(100vh-6rem)]">
            {/* Conversations List */}
            <div className="w-1/3 border-r bg-gray-50 flex flex-col min-w-[250px]">
              <div className="p-4 border-b bg-white">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <MessageSquare size={18} className="text-brand-600"/> Discussions
                </h3>
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                   <input 
                     type="text" 
                     placeholder="Rechercher..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-brand-300 rounded-lg text-sm outline-none transition-colors" 
                   />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                 {filteredConversations.map(c => {
                    const chatPartner = resolveChatPartner(c);
                    const isSelected = c.id === selectedConversationId;
                    
                    return (
                      <div 
                       key={c.id} 
                       onClick={() => setSelectedConversationId(c.id)} 
                       className={`p-4 border-b cursor-pointer transition-colors ${isSelected ? 'bg-white border-l-4 border-l-brand-600 shadow-sm' : 'hover:bg-gray-100 bg-gray-50/50'}`}
                      >
                         <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="relative">
                               <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500 font-bold border border-gray-100 shrink-0">
                                  {chatPartner.type === 'SUPPORT' 
                                     ? <LifeBuoy size={20} className="text-brand-600" />
                                     : (chatPartner.avatar 
                                         ? <img src={chatPartner.avatar} className="w-full h-full object-cover" alt="" />
                                         : chatPartner.name[0])}
                               </div>
                               {/* Status Dot */}
                               {chatPartner.type !== 'SUPPORT' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                            </div>

                            <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start">
                                  <div className={`font-bold text-sm truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                     {chatPartner.name}
                                  </div>
                                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                    {c.lastMessageDate ? new Date(c.lastMessageDate).toLocaleDateString() : ''}
                                  </span>
                               </div>
                               
                               <div className="flex items-center gap-1 mt-0.5 mb-1">
                                  {chatPartner.type === 'SUPPORT' ? (
                                     <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                                       <LifeBuoy size={8} /> Support
                                     </span>
                                  ) : chatPartner.type === 'PARTNER' ? (
                                     <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                                       <Briefcase size={8} /> Partenaire
                                     </span>
                                  ) : (
                                     <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                                       <User size={8} /> Client
                                     </span>
                                  )}
                               </div>

                               <div className={`text-xs truncate ${c.isVirtual ? 'text-brand-600 font-medium italic' : (isSelected ? 'text-gray-600' : 'text-gray-400')}`}>
                                  {c.isVirtual ? 'Nouvelle discussion' : c.lastMessage}
                                </div>
                            </div>
                         </div>
                      </div>
                    )
                 })}
                 
                 {filteredConversations.length === 0 && (
                      <div className="p-8 text-center text-gray-400 text-sm italic">
                          Aucune conversation trouvée.
                      </div>
                 )}
                 
                 {!hasSupport && (
                    <div className="p-4 mt-auto">
                        <button onClick={startSupportChat} className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200">
                            Contacter le Support
                        </button>
                    </div>
                 )}
              </div>
            </div>

            {/* Chat Window */}
            <div className="w-2/3 flex flex-col bg-white h-full relative">
                {selectedConversationId && currentChatPartner ? (
                   <>
                     {/* Chat Header */}
                     <div className="p-4 border-b flex justify-between items-center bg-white z-10 shadow-sm">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 shrink-0 overflow-hidden">
                               {currentChatPartner.type === 'SUPPORT' 
                                     ? <LifeBuoy size={20} className="text-brand-600" />
                                     : (currentChatPartner.avatar 
                                         ? <img src={currentChatPartner.avatar} className="w-full h-full object-cover" alt="" />
                                         : currentChatPartner.name[0])}
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                  {currentChatPartner.name}
                                  {currentChatPartner.type === 'SUPPORT' && <CheckCircle size={14} className="text-brand-500" />}
                              </h3>
                              <div className="text-xs text-gray-500 flex items-center gap-3">
                                  {(currentChatPartner.data as any)?.email && <span className="flex items-center gap-1"><Mail size={10} /> {(currentChatPartner.data as any).email}</span>}
                                  {currentChatPartner.data?.phone && <span className="flex items-center gap-1"><Phone size={10} /> {currentChatPartner.data.phone}</span>}
                              </div>
                           </div>
                        </div>
                        {currentChatPartner.type !== 'SUPPORT' && (
                            <button 
                                onClick={() => openProfile(currentChatPartner.data, currentChatPartner.type as any)}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1"
                            >
                                <User size={14} /> Voir Profil
                            </button>
                        )}
                     </div>

                     {/* Messages Area */}
                     <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
                        {(currentMessages.length === 0 || currentConversation?.isVirtual) && (
                             <div className="text-center py-12 text-gray-400">
                                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <MessageSquare className="text-gray-300" size={32} />
                                 </div>
                                 <p className="font-medium text-gray-500">C'est le début de votre conversation</p>
                                 <p className="text-xs mt-1">Écrivez votre premier message ci-dessous.</p>
                             </div>
                         )}
                        {currentMessages.map(m => (
                            <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex flex-col ${m.senderId === user.id ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                    <div className={`px-4 py-3 text-sm rounded-2xl shadow-sm ${
                                        m.senderId === user.id 
                                        ? 'bg-brand-600 text-white rounded-tr-none' 
                                        : 'bg-white border text-gray-800 rounded-tl-none'
                                    }`}>
                                    {m.content}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                        {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                     </div>

                     {/* Input Area */}
                     <div className="p-4 border-t bg-white">
                        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                            <input 
                                value={messageInput} 
                                onChange={e => setMessageInput(e.target.value)} 
                                className="flex-1 bg-gray-100 border-transparent focus:bg-white border focus:ring-2 focus:ring-brand-500 rounded-full pl-5 pr-12 py-3 text-sm outline-none transition-all" 
                                placeholder="Écrivez votre réponse..." 
                            />
                            <button 
                                type="submit" 
                                className={`absolute right-1 top-1 p-2 rounded-full text-white transition-all ${messageInput.trim() ? 'bg-brand-600 hover:bg-brand-700' : 'bg-gray-300 cursor-not-allowed'}`}
                                disabled={!messageInput.trim()}
                            >
                                <Send size={18}/>
                            </button>
                        </form>
                     </div>
                   </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-white">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={40} className="text-gray-300" />
                        </div>
                        <p className="font-medium text-gray-400">Sélectionnez une discussion pour afficher les messages</p>
                    </div>
                )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default PartnerDashboard;