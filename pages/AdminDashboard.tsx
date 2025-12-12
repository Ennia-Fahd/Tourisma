import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { PARTNERS, updatePartnerStatus, getAllBookings, CONVERSATIONS, MESSAGES, getPartnerById, getUserById, SUPPORT_PARTNER_ID, sendMessage } from '../services/mockData';
import { PartnerStatus, UserRole } from '../types';
import { CheckCircle, XCircle, AlertTriangle, Search, BarChart3, Users, MessageSquare, Send, Ban, RefreshCw, Lock, ShieldAlert, ExternalLink, User, Briefcase, Phone, Mail } from 'lucide-react';
import ProfileModal from '../components/ProfileModal';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('partners');
  
  // Initialisation avec une copie profonde pour garantir la réactivité
  const [partners, setPartners] = useState(() => PARTNERS.map(p => ({ ...p })));
  const [allBookings, setAllBookings] = useState<any[]>([]);
  
  // Messaging state
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [refresh, setRefresh] = useState(0); 
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Profile Modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileType, setProfileType] = useState<'CLIENT' | 'PARTNER'>('CLIENT');

  // Initialize bookings for stats
  useEffect(() => {
    setAllBookings(getAllBookings());
  }, []);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (activeTab === 'messages' && selectedConversationId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, selectedConversationId, refresh, messageInput]); // Trigger scroll on input change too (optional but helps)

  if (!user) return null;

  // Filter lists
  const visiblePartners = partners.filter(p => p.id !== SUPPORT_PARTNER_ID);
  const pendingPartners = visiblePartners.filter(p => p.status === PartnerStatus.EN_ATTENTE_VALIDATION);
  const activePartners = visiblePartners.filter(p => p.status === PartnerStatus.ACTIF);
  const suspendedPartners = visiblePartners.filter(p => p.status === PartnerStatus.SUSPENDU);

  const handlePartnerAction = (id: string, newStatus: PartnerStatus) => {
    setPartners(prevPartners => prevPartners.map(p => {
        if (p.id === id) {
            return { ...p, status: newStatus };
        }
        return p;
    }));
    updatePartnerStatus(id, newStatus);
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!messageInput.trim() || !selectedConversationId) return;

      const conversation = CONVERSATIONS.find(c => c.id === selectedConversationId);
      if (conversation) {
          const receiverId = conversation.clientId;
          sendMessage(user.id, receiverId, messageInput);
          setMessageInput('');
          setRefresh(prev => prev + 1);
      }
  };

  const openProfile = (data: any, type: 'CLIENT' | 'PARTNER') => {
      setProfileData(data);
      setProfileType(type);
      setProfileModalOpen(true);
  };

  // Logic to identify user role in chat (Client or Partner)
  const resolveUserRole = (userId: string) => {
      const partner = PARTNERS.find(p => p.userId === userId);
      if (partner) {
          return { type: 'PARTNER' as const, data: partner };
      }
      return { type: 'CLIENT' as const, data: getUserById(userId) };
  };

  const supportConversations = CONVERSATIONS.filter(c => c.partnerId === SUPPORT_PARTNER_ID);

  const displayedConversations = supportConversations.filter(c => {
    const client = getUserById(c.clientId);
    const searchLower = searchTerm.toLowerCase();
    const partner = PARTNERS.find(p => p.userId === c.clientId);
    
    // Search by User Name, Partner Company Name, or Last Message
    return (
      (client?.name.toLowerCase().includes(searchLower) || '') ||
      (partner?.companyName.toLowerCase().includes(searchLower) || '') ||
      c.lastMessage.toLowerCase().includes(searchLower)
    );
  });

  const currentConversation = CONVERSATIONS.find(c => c.id === selectedConversationId);
  const currentClientUser = currentConversation ? getUserById(currentConversation.clientId) : null;
  const currentUserRoleInfo = currentConversation ? resolveUserRole(currentConversation.clientId) : null;
  
  // Admin is always 'u3' (p0), the other is currentClientUser
  const currentMessages = (currentClientUser) ? MESSAGES.filter(m => 
    (m.senderId === currentClientUser.id && m.receiverId === user.id) || 
    (m.senderId === user.id && m.receiverId === currentClientUser.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) : [];

  return (
    <div className="min-h-screen bg-gray-100 flex">
       <ProfileModal 
          isOpen={profileModalOpen} 
          onClose={() => setProfileModalOpen(false)} 
          type={profileType} 
          data={profileData} 
       />

       {/* Admin Sidebar */}
       <aside className="w-20 lg:w-64 bg-gray-900 text-white flex flex-col fixed h-full z-10 transition-all duration-300">
         <div className="p-6 font-bold text-xl tracking-wider hidden lg:block text-brand-500">ADMIN</div>
         <nav className="mt-8 flex-1">
           <button onClick={() => setActiveTab('partners')} className={`w-full text-left p-4 hover:bg-gray-800 flex items-center gap-4 transition-colors ${activeTab === 'partners' ? 'bg-brand-600 text-white' : 'text-gray-400'}`}>
             <Users size={20} /> <span className="hidden lg:block">Partenaires</span>
           </button>
           <button onClick={() => setActiveTab('messages')} className={`w-full text-left p-4 hover:bg-gray-800 flex items-center gap-4 transition-colors ${activeTab === 'messages' ? 'bg-brand-600 text-white' : 'text-gray-400'}`}>
             <MessageSquare size={20} /> <span className="hidden lg:block">Messagerie Support</span>
           </button>
           <button onClick={() => setActiveTab('stats')} className={`w-full text-left p-4 hover:bg-gray-800 flex items-center gap-4 transition-colors ${activeTab === 'stats' ? 'bg-brand-600 text-white' : 'text-gray-400'}`}>
             <BarChart3 size={20} /> <span className="hidden lg:block">Statistiques</span>
           </button>
         </nav>
       </aside>

       <main className="flex-1 p-8 overflow-y-auto ml-20 lg:ml-64 h-screen flex flex-col">
         {activeTab === 'partners' && (
           <div className="space-y-8 pb-10">
             {/* 1. Pending Approvals Section */}
             {pendingPartners.length > 0 && (
               <div className="bg-white rounded-xl shadow-sm border border-yellow-200 overflow-hidden mb-8 animate-fade-in">
                 <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100 flex items-center gap-2">
                   <AlertTriangle className="text-yellow-600" size={20} />
                   <h2 className="font-bold text-yellow-900">En attente de validation ({pendingPartners.length})</h2>
                 </div>
                 <div className="divide-y">
                   {pendingPartners.map(partner => (
                     <div key={partner.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                       <div>
                         <h3 className="font-bold text-lg">{partner.companyName}</h3>
                         <p className="text-gray-500 text-sm">{partner.description}</p>
                         <div className="flex gap-4 mt-2 text-xs text-gray-400">
                           <span>{partner.city}</span>
                           <span>{partner.phone}</span>
                         </div>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => handlePartnerAction(partner.id, PartnerStatus.ACTIF)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1">
                             <CheckCircle size={16} /> Valider
                         </button>
                         <button onClick={() => handlePartnerAction(partner.id, PartnerStatus.SUSPENDU)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1">
                             <XCircle size={16} /> Rejeter
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* 2. Active Partners Table */}
             <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-600"/> Partenaires Actifs ({activePartners.length})
                  </h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Rechercher..." className="pl-10 pr-4 py-2 bg-white border rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-200" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                      <tr>
                        <th className="p-4">Entreprise</th>
                        <th className="p-4">Ville</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {activePartners.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">Aucun partenaire actif.</td></tr>
                      )}
                      {activePartners.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium">
                            <button 
                                onClick={() => openProfile(p, 'PARTNER')}
                                className="text-left group"
                            >
                                <div className="text-gray-900 group-hover:text-brand-600 transition-colors flex items-center gap-2">
                                    {p.companyName}
                                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle size={10}/> Compte Actif</div>
                            </button>
                          </td>
                          <td className="p-4 text-gray-500">{p.city}</td>
                          <td className="p-4 text-gray-500 text-sm">{p.phone}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handlePartnerAction(p.id, PartnerStatus.SUSPENDU); }}
                                    className="flex items-center gap-1.5 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-100 z-10 active:scale-95"
                                    title="Suspendre ce compte"
                                >
                                    <Ban size={14} /> Suspendre
                                </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
             
             {/* 3. Suspended Partners Section */}
             {suspendedPartners.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden mt-8">
                    <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50/50">
                    <h2 className="font-bold text-red-900 flex items-center gap-2">
                        <ShieldAlert size={18} className="text-red-600"/> Comptes Suspendus ({suspendedPartners.length})
                    </h2>
                    </div>
                    <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <tbody className="divide-y">
                        {suspendedPartners.map(p => (
                            <tr key={p.id} className="bg-red-50/10 hover:bg-red-50/30 transition-colors">
                            <td className="p-4 font-medium text-gray-500 opacity-75">
                                <div className="line-through decoration-red-400">{p.companyName}</div>
                                <div className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1"><Lock size={10}/> Accès bloqué</div>
                            </td>
                            <td className="p-4 text-gray-400">{p.city}</td>
                            <td className="p-4 text-gray-400 text-sm">{p.phone}</td>
                            <td className="p-4 text-right">
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handlePartnerAction(p.id, PartnerStatus.ACTIF); }}
                                    className="flex items-center gap-1.5 text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-green-100 z-10 active:scale-95"
                                >
                                    <RefreshCw size={14} /> Réactiver
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
             )}
           </div>
         )}
         
         {activeTab === 'messages' && (
           <div className="bg-white border rounded-xl overflow-hidden shadow-sm flex flex-1 h-full max-h-[calc(100vh-6rem)]">
             {/* Conversations List */}
             <div className="w-1/3 border-r bg-gray-50 flex flex-col min-w-[250px]">
               <div className="p-4 border-b bg-white">
                 <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <MessageSquare size={18} className="text-brand-600"/> Tickets Support
                 </h3>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Rechercher un utilisateur..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-brand-300 rounded-lg text-sm outline-none transition-colors" 
                    />
                 </div>
               </div>
               
               <div className="flex-1 overflow-y-auto">
                  {displayedConversations.map(c => {
                     const roleInfo = resolveUserRole(c.clientId);
                     const client = getUserById(c.clientId);
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
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500 font-bold border border-gray-100">
                                   {roleInfo.type === 'PARTNER' 
                                      ? (roleInfo.data.companyName?.[0] || 'P') 
                                      : (roleInfo.data?.name?.[0] || 'U')}
                                </div>
                                {/* Status Dot (Optional - Mocked) */}
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                             </div>

                             <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                   <div className={`font-bold text-sm truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                      {roleInfo.type === 'PARTNER' ? roleInfo.data.companyName : roleInfo.data?.name}
                                   </div>
                                   <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                     {c.lastMessageDate ? new Date(c.lastMessageDate).toLocaleDateString() : ''}
                                   </span>
                                </div>
                                
                                <div className="flex items-center gap-1 mt-0.5 mb-1">
                                   {roleInfo.type === 'PARTNER' ? (
                                      <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                                        <Briefcase size={8} /> Partenaire
                                      </span>
                                   ) : (
                                      <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                                        <User size={8} /> Client
                                      </span>
                                   )}
                                </div>

                                <div className={`text-xs truncate ${isSelected ? 'text-gray-600' : 'text-gray-400'}`}>
                                   {c.lastMessage}
                                </div>
                             </div>
                          </div>
                       </div>
                     )
                  })}
                  {displayedConversations.length === 0 && (
                      <div className="p-8 text-center text-gray-400 text-sm italic">
                          Aucune conversation trouvée.
                      </div>
                  )}
               </div>
             </div>

             {/* Chat Window */}
             <div className="w-2/3 flex flex-col bg-white h-full relative">
                {selectedConversationId && currentUserRoleInfo ? (
                   <>
                     {/* Chat Header */}
                     <div className="p-4 border-b flex justify-between items-center bg-white z-10 shadow-sm">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                               {currentUserRoleInfo.type === 'PARTNER' ? currentUserRoleInfo.data.companyName[0] : currentUserRoleInfo.data?.name?.[0]}
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                  {currentUserRoleInfo.type === 'PARTNER' ? currentUserRoleInfo.data.companyName : currentUserRoleInfo.data?.name}
                                  {currentUserRoleInfo.type === 'PARTNER' && <CheckCircle size={14} className="text-green-500" />}
                              </h3>
                              <div className="text-xs text-gray-500 flex items-center gap-3">
                                  <span className="flex items-center gap-1"><Mail size={10} /> {currentUserRoleInfo.type === 'CLIENT' ? (currentUserRoleInfo.data?.email || 'Email masqué') : (getUserById(currentUserRoleInfo.data.userId)?.email || 'Email masqué')}</span>
                                  {currentUserRoleInfo.type === 'PARTNER' && <span className="flex items-center gap-1"><Phone size={10} /> {currentUserRoleInfo.data.phone}</span>}
                              </div>
                           </div>
                        </div>
                        <button 
                            onClick={() => openProfile(currentUserRoleInfo.data, currentUserRoleInfo.type as any)}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1"
                        >
                            <User size={14} /> Voir Profil
                        </button>
                     </div>

                     {/* Messages Area */}
                     <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
                        {currentMessages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                <MessageSquare size={48} className="mb-2" />
                                <p>Début de la conversation</p>
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
                        <p className="font-medium text-gray-400">Sélectionnez une conversation pour répondre</p>
                    </div>
                )}
             </div>
           </div>
         )}
         
         {activeTab === 'stats' && (
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                 <h3 className="text-gray-500 text-sm font-medium">Total Partenaires</h3>
                 <p className="text-3xl font-bold mt-2">{visiblePartners.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                 <h3 className="text-gray-500 text-sm font-medium">Réservations</h3>
                 <p className="text-3xl font-bold mt-2">{allBookings.length}</p>
              </div>
           </div>
         )}
       </main>
    </div>
  );
};

export default AdminDashboard;