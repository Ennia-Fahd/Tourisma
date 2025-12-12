import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { getClientBookings, MESSAGES, CONVERSATIONS, getPartnerById, updateBookingStatus, sendMessage, SUPPORT_PARTNER_ID, initializeSupportChat } from '../services/mockData';
import { BookingStatus, UserRole } from '../types';
import { Calendar, MessageSquare, Clock, CheckCircle, XCircle, List, Send, User, LifeBuoy, ExternalLink, Search, MapPin, Mail, Phone, Briefcase } from 'lucide-react';
import CalendarView from '../components/CalendarView';
import ProfileModal from '../components/ProfileModal';
import { useLocation } from 'react-router-dom';

const ClientDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'bookings' | 'messages' | 'calendar'>('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  
  // Messaging state
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [refresh, setRefresh] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Search for partners in messages
  const [searchTerm, setSearchTerm] = useState('');
  
  // Extra state to handle "Contact Partner" from details page
  const [startChatPartnerId, setStartChatPartnerId] = useState<string | null>(null);
  
  // Quick Replies
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);

  // Profile Modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Initialize automated support chat
  useEffect(() => {
     if (user) {
         initializeSupportChat(user);
         setRefresh(prev => prev + 1);
     }
  }, [user]);

  // Handle incoming navigation state (e.g. from ExperienceDetails)
  useEffect(() => {
    if (location.state) {
        if (location.state.activeTab) {
            setActiveTab(location.state.activeTab);
        }
        if (location.state.startConversationWith) {
            setStartChatPartnerId(location.state.startConversationWith);
        }
        if (location.state.selectedConversationId) {
            setSelectedConversationId(location.state.selectedConversationId);
        }
        if (location.state.suggestedReplies) {
            setSuggestedReplies(location.state.suggestedReplies);
        }
    }
  }, [location]);

  // Effect to load bookings
  useEffect(() => {
    if (user) {
      setBookings(getClientBookings(user.id));
    }
  }, [user]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (activeTab === 'messages' && selectedConversationId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, selectedConversationId, refresh, messageInput, suggestedReplies]);

  if (!user) return null;

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
      updateBookingStatus(bookingId, BookingStatus.CANCELLED);
      setBookings(getClientBookings(user.id));
    }
  };

  const handleContactPartner = (partnerId: string) => {
      setStartChatPartnerId(partnerId);
      setActiveTab('messages');
  };

  const handleSendMessage = (e: React.FormEvent, content: string = messageInput) => {
    if (e) e.preventDefault();
    if (!content.trim() || !selectedConversationId) return;

    // The selectedConversationId might be virtual (e.g., 'new_p1') or real (e.g., 'c1').
    const conversation = displayConversations.find(c => c.id === selectedConversationId);
    
    if (conversation) {
      const partner = conversation.partner;
      if (partner) {
        const result = sendMessage(user.id, partner.userId, content);
        if (result) {
            if (conversation.isVirtual) {
                setSelectedConversationId(result.id);
            }
        }
        setMessageInput('');
        setSuggestedReplies([]); // Clear suggestions after sending
        setRefresh(prev => prev + 1); 
      }
    }
  };

  const startSupportChat = () => {
     const existingConv = displayConversations.find(c => c.partnerId === SUPPORT_PARTNER_ID);
     if (existingConv) {
         setSelectedConversationId(existingConv.id);
     }
     setActiveTab('messages');
  };

  const openPartnerProfile = (partner: any) => {
      if(!partner) return;
      setProfileData(partner);
      setProfileModalOpen(true);
  };
  
  const StatusBadge = ({ status }: { status: BookingStatus }) => {
    switch (status) {
      case BookingStatus.PENDING:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1"><Clock size={10}/> En attente</span>;
      case BookingStatus.CONFIRMED:
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle size={10}/> Confirmé</span>;
      case BookingStatus.CANCELLED:
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle size={10}/> Annulé</span>;
      case BookingStatus.COMPLETED:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Terminé</span>;
      default:
        return null;
    }
  };

  // --- Derive Display Conversations ---
  
  // 1. Existing Real Conversations (Includes Support because we auto-initialized it)
  const displayConversations = CONVERSATIONS.filter(c => c.clientId === user.id).map(c => ({
      ...c,
      partner: getPartnerById(c.partnerId)!,
      isVirtual: false
  }));

  // 2. Handle "Contact Partner" request from details page (Virtual Conversation if needed)
  if (startChatPartnerId) {
      const alreadyInList = displayConversations.find(c => c.partnerId === startChatPartnerId);
      if (!alreadyInList) {
          const newPartner = getPartnerById(startChatPartnerId);
          if (newPartner) {
              const virtualConv = {
                  id: `new_${startChatPartnerId}`,
                  clientId: user.id,
                  partnerId: startChatPartnerId,
                  lastMessage: 'Démarrer la discussion',
                  lastMessageDate: '',
                  partner: newPartner,
                  isVirtual: true
              };
              displayConversations.unshift(virtualConv);
          }
      }
  }

  // Filter conversations
  const filteredConversations = displayConversations.filter(c => 
      c.partner.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Effect to auto-select conversation if coming from contact button
  useEffect(() => {
     if (startChatPartnerId && !selectedConversationId) {
         const targetId = displayConversations.find(c => c.partnerId === startChatPartnerId)?.id;
         if (targetId) setSelectedConversationId(targetId);
     }
  }, [startChatPartnerId, displayConversations, selectedConversationId]);


  // Get current messages for selected conversation
  const currentConversation = displayConversations.find(c => c.id === selectedConversationId);
  const currentPartner = currentConversation?.partner;
  
  const currentMessages = (!currentConversation?.isVirtual && currentPartner) ? MESSAGES.filter(m => 
    (m.senderId === user.id && m.receiverId === currentPartner.userId) || 
    (m.senderId === currentPartner.userId && m.receiverId === user.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen flex flex-col">
      <ProfileModal 
         isOpen={profileModalOpen} 
         onClose={() => setProfileModalOpen(false)} 
         type="PARTNER"
         data={profileData}
      />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bonjour, {user.name}</h1>
        <p className="text-gray-500">Gérez vos voyages et communiquez avec les organisateurs.</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6 sticky top-0 bg-white/95 backdrop-blur z-20">
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`pb-4 px-6 font-medium text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'bookings' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <List size={16} /> Mes Réservations
          {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`pb-4 px-6 font-medium text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'calendar' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Calendar size={16} /> Calendrier
          {activeTab === 'calendar' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`pb-4 px-6 font-medium text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'messages' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <MessageSquare size={16} /> Messagerie
          {activeTab === 'messages' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600"></div>}
        </button>
      </div>

      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white border rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src={booking.experience?.images[0]} alt="thumb" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{booking.experience?.title}</h3>
                  
                  {/* Clickable Partner Name */}
                  {booking.experience && (
                     <div className="text-sm mt-1 flex items-center gap-1">
                        <span className="text-gray-500">avec </span>
                        <button 
                            onClick={() => {
                                const p = getPartnerById(booking.experience.partnerId);
                                openPartnerProfile(p);
                            }}
                            className="font-medium text-brand-600 hover:underline flex items-center gap-1"
                        >
                            <Briefcase size={12} />
                            {booking.partnerName || "Partenaire"}
                        </button>
                     </div>
                  )}

                  <div className="flex items-center text-sm text-gray-500 mt-2 gap-3">
                     <span className="flex items-center gap-1"><Calendar size={14} /> {booking.date}</span>
                     <span className="flex items-center gap-1"><Clock size={14} /> {booking.time || 'N/A'}</span>
                     <span className="flex items-center gap-1"><User size={14} /> {booking.guests} Pers.</span>
                  </div>
                  <div className="mt-2 font-bold text-gray-900">{booking.totalPrice} MAD</div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col items-end gap-3">
                <StatusBadge status={booking.status} />
                <div className="flex gap-2">
                   {/* Contact Button */}
                    <button 
                        onClick={() => handleContactPartner(booking.experience.partnerId)}
                        className="text-sm border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1"
                    >
                        <MessageSquare size={14} /> Contacter
                    </button>
                    
                    {booking.status === BookingStatus.PENDING && (
                    <button onClick={() => handleCancelBooking(booking.id)} className="text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium">Annuler</button>
                    )}
                    {booking.status === BookingStatus.CONFIRMED && (
                    <button className="text-sm text-brand-600 font-medium hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors">Reçu</button>
                    )}
                </div>
              </div>
            </div>
          ))}
          {bookings.length === 0 && <div className="text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed">Aucune réservation pour le moment.</div>}
        </div>
      )}

      {activeTab === 'calendar' && (
        <div>
          <CalendarView bookings={bookings} role={UserRole.CLIENT} />
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm flex flex-1 h-[600px] max-h-[80vh]">
          {/* Chat List */}
          <div className="w-1/3 border-r bg-gray-50 flex flex-col min-w-[280px]">
             <div className="p-4 border-b bg-white">
                 <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-gray-700 text-lg">Discussions</span>
                    <button onClick={startSupportChat} className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full hover:bg-brand-100 flex items-center gap-1 font-semibold transition-colors" title="Contacter le support">
                        <LifeBuoy size={12}/> Support
                    </button>
                 </div>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Rechercher un partenaire..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-brand-300 rounded-lg text-sm outline-none transition-colors" 
                    />
                 </div>
             </div>
             
             <div className="flex-1 overflow-y-auto">
                {filteredConversations.map(c => {
                   const isSelected = c.id === selectedConversationId;
                   const isSupport = c.partnerId === SUPPORT_PARTNER_ID;
                   
                   return (
                     <div 
                       key={c.id} 
                       onClick={() => setSelectedConversationId(c.id)}
                       className={`p-4 border-b cursor-pointer transition-colors ${isSelected ? 'bg-white border-l-4 border-l-brand-600 shadow-sm' : 'hover:bg-gray-100 bg-gray-50/50'}`}
                     >
                        <div className="flex items-start gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${isSupport ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                              {isSupport ? <LifeBuoy size={20}/> : (c.partner.companyName[0])}
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-start">
                                <div className={`font-bold text-sm truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {c.partner.companyName}
                                </div>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-1">
                                    {c.lastMessageDate ? new Date(c.lastMessageDate).toLocaleDateString() : ''}
                                </span>
                             </div>
                             
                             {!isSupport && (
                                <div className="flex items-center gap-1 mt-0.5 mb-1">
                                   <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                                      <Briefcase size={8} /> Partenaire
                                   </span>
                                </div>
                             )}

                             <div className={`text-xs truncate ${c.isVirtual ? 'text-brand-600 font-medium italic' : (isSelected ? 'text-gray-600' : 'text-gray-400')}`}>
                               {c.isVirtual ? 'Nouvelle discussion' : c.lastMessage}
                             </div>
                           </div>
                        </div>
                     </div>
                   )
                })}
                {filteredConversations.length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    Aucune conversation trouvée.
                    <button onClick={startSupportChat} className="block mx-auto mt-2 text-brand-600 font-medium hover:underline">Contacter le support</button>
                  </div>
                )}
             </div>
          </div>
          
          {/* Chat Content */}
          <div className="w-2/3 flex flex-col bg-white relative">
              {selectedConversationId ? (
                <>
                  <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${currentConversation?.partnerId === SUPPORT_PARTNER_ID ? 'bg-brand-600' : 'bg-gray-800'}`}>
                        {currentConversation?.partnerId === SUPPORT_PARTNER_ID ? <LifeBuoy size={20} /> : currentPartner?.companyName.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                {currentPartner?.companyName}
                                {currentConversation?.partnerId !== SUPPORT_PARTNER_ID && <CheckCircle size={14} className="text-green-500" />}
                            </h3>
                            <div className="text-xs text-gray-500 flex items-center gap-3">
                                {currentPartner?.id !== SUPPORT_PARTNER_ID && (
                                    <>
                                        <span className="flex items-center gap-1"><MapPin size={10} /> {currentPartner?.city}</span>
                                        <span className="flex items-center gap-1"><Phone size={10} /> {currentPartner?.phone}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {currentConversation?.partnerId !== SUPPORT_PARTNER_ID && (
                        <button 
                            onClick={() => openPartnerProfile(currentPartner)}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1"
                        >
                            <Briefcase size={14} /> Voir Profil
                        </button>
                    )}
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
                     {/* Default Message / Empty State */}
                     {(currentMessages.length === 0 || currentConversation?.isVirtual) && (
                         <div className="text-center py-12 text-gray-400">
                             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <MessageSquare className="text-gray-300" size={32} />
                             </div>
                             <p className="font-medium text-gray-500">C'est le début de votre conversation</p>
                             <p className="text-xs mt-1">N'hésitez pas à poser vos questions à {currentPartner?.companyName}.</p>
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
                                <div className={`text-[10px] mt-1 px-1 ${m.senderId === user.id ? 'text-gray-400' : 'text-gray-400'}`}>
                                 {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </div>
                            </div>
                        </div>
                     ))}
                     
                     {/* Suggested Replies Chips */}
                     {suggestedReplies.length > 0 && currentMessages.length > 0 && currentMessages[currentMessages.length-1].senderId !== user.id && (
                        <div className="flex flex-wrap justify-end gap-2 mt-4 pt-2 border-t border-gray-100">
                            {suggestedReplies.map((reply, idx) => (
                                <button 
                                    key={idx}
                                    onClick={(e) => handleSendMessage(e, reply)}
                                    className="text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-1.5 rounded-full border border-brand-100 transition-colors"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                     )}
                     
                     <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="p-4 border-t bg-white">
                     <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-2 relative">
                        <input 
                          type="text" 
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder={currentConversation?.isVirtual ? "Démarrer la discussion..." : "Écrivez votre message..."}
                          className="flex-1 bg-gray-100 border-transparent focus:bg-white border focus:ring-2 focus:ring-brand-500 rounded-full pl-5 pr-12 py-3 text-sm outline-none transition-all" 
                        />
                        <button 
                            type="submit" 
                            className={`absolute right-1 top-1 p-2 rounded-full text-white transition-all ${messageInput.trim() ? 'bg-brand-600 hover:bg-brand-700' : 'bg-gray-300 cursor-not-allowed'}`}
                            disabled={!messageInput.trim()}
                        >
                          <Send size={18} />
                        </button>
                     </form>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 bg-white">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                     <MessageSquare size={40} className="text-gray-300" />
                  </div>
                  <p className="font-medium text-gray-400">Sélectionnez une conversation pour commencer</p>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;