
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { getClientBookings, MESSAGES, CONVERSATIONS, getPartnerById, updateBookingStatus, sendMessage, SUPPORT_PARTNER_ID, initializeSupportChat, addReview, BOOKINGS, markMessagesAsRead } from '../services/mockData';
import { BookingStatus, UserRole } from '../types';
import { Calendar, MessageSquare, Clock, CheckCircle, XCircle, List, Send, User as UserIcon, LifeBuoy, ExternalLink, Search, MapPin, Mail, Phone, Briefcase, Star, Info, LogOut, Compass, AlertCircle } from 'lucide-react';
import CalendarView from '../components/CalendarView';
import ProfileModal from '../components/ProfileModal';
import ReviewModal from '../components/ReviewModal';
import { useLocation, useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const { user, logout, refreshUnread, unreadCount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bookings' | 'messages' | 'calendar'>('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  
  // Messaging States
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [refresh, setRefresh] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<any>(null);

  useEffect(() => {
     if (user) {
         initializeSupportChat(user);
         setRefresh(prev => prev + 1);
     }
  }, [user]);

  useEffect(() => {
    if (location.state) {
        if (location.state.activeTab) setActiveTab(location.state.activeTab);
        if (location.state.selectedConversationId) setSelectedConversationId(location.state.selectedConversationId);
    }
  }, [location]);

  useEffect(() => {
    if (user) setBookings(getClientBookings(user.id));
  }, [user, refresh]);

  // Mark messages as read when a conversation is selected
  useEffect(() => {
    if (user && selectedConversationId && activeTab === 'messages') {
       const conv = displayConversations.find(c => c.id === selectedConversationId);
       if (conv && conv.partner) {
         markMessagesAsRead(user.id, conv.partner.userId);
         refreshUnread();
       }
    }
  }, [selectedConversationId, user, refresh, activeTab]);

  useEffect(() => {
    if (activeTab === 'messages' && selectedConversationId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, selectedConversationId, refresh, messageInput]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
      updateBookingStatus(bookingId, BookingStatus.CANCELLED);
      setRefresh(p => p + 1);
    }
  };

  const handleOpenReview = (booking: any) => {
    setReviewTarget(booking);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = (rating: number, comment: string) => {
    if (!user || !reviewTarget) return;
    addReview({
      experienceId: reviewTarget.experienceId,
      userId: user.id,
      userName: user.name,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    });
    const b = BOOKINGS.find(book => book.id === reviewTarget.id);
    if (b) b.hasReviewed = true;
    setReviewModalOpen(false);
    setRefresh(p => p + 1);
    alert("Merci pour votre avis !");
  };

  const handleSendMessage = (e: React.FormEvent, content: string = messageInput) => {
    if (e) e.preventDefault();
    if (!content.trim() || !selectedConversationId) return;
    const conversation = displayConversations.find(c => c.id === selectedConversationId);
    if (conversation && conversation.partner) {
      sendMessage(user.id, conversation.partner.userId, content);
      setMessageInput('');
      setRefresh(prev => prev + 1); 
    }
  };

  const StatusBadge = ({ status }: { status: BookingStatus }) => {
    switch (status) {
      case BookingStatus.PENDING: 
        return <span className="px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-amber-100 shadow-sm"><Clock size={12}/> En attente de validation</span>;
      case BookingStatus.CONFIRMED: 
        return <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-green-100 shadow-sm"><CheckCircle size={12}/> Confirmée & au calendrier</span>;
      case BookingStatus.CANCELLED: 
        return <span className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-red-100 shadow-sm"><XCircle size={12}/> Annulée</span>;
      case BookingStatus.COMPLETED: 
        return <span className="px-4 py-2 bg-gray-50 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">Expérience terminée</span>;
      default: return null;
    }
  };

  const displayConversations = CONVERSATIONS.filter(c => c.clientId === user.id).map(c => ({
      ...c, 
      partner: getPartnerById(c.partnerId)!,
      unreadCount: MESSAGES.filter(m => m.receiverId === user.id && m.senderId === getPartnerById(c.partnerId)!.userId && !m.read).length
  }));

  const filteredConversations = displayConversations.filter(c => 
      c.partner.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentConversation = displayConversations.find(c => c.id === selectedConversationId);
  const currentPartner = currentConversation?.partner;
  const currentMessages = (currentPartner) ? MESSAGES.filter(m => (m.senderId === user.id && m.receiverId === currentPartner.userId) || (m.senderId === currentPartner.userId && m.receiverId === user.id)).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 min-h-screen flex flex-col">
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} type="PARTNER" data={profileData} />
      <ReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} experienceName={reviewTarget?.experience?.title || ''} onSubmit={handleSubmitReview} />
      
      <div className="mb-10 animate-fade-in flex justify-between items-start">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="p-4 bg-brand-50 text-brand-600 rounded-2xl hover:bg-brand-600 hover:text-white transition-all shadow-sm"
          >
            <Compass size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-gray-900 leading-tight mb-2 tracking-tighter">Ahlan, {user.name}</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Tableau de bord Client</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm"
        >
          <LogOut size={16} /> Déconnexion
        </button>
      </div>

      <div className="flex border-b border-gray-100 mb-10 sticky top-0 bg-gray-50/90 backdrop-blur-xl z-20 pt-2 no-scrollbar overflow-x-auto whitespace-nowrap">
        {[
          { id: 'bookings', label: 'Mes Réservations', icon: List },
          { id: 'calendar', label: 'Calendrier', icon: Calendar },
          { id: 'messages', label: 'Messagerie', icon: MessageSquare, badge: unreadCount },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`pb-5 px-8 font-black text-xs uppercase tracking-widest transition-all relative flex items-center gap-3 ${activeTab === tab.id ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <tab.icon size={16} /> 
            {tab.label} 
            {tab.badge ? (
              <span className="bg-brand-500 text-white text-[10px] h-4 min-w-[1rem] px-1.5 flex items-center justify-center rounded-full animate-pulse shadow-lg shadow-brand-100">
                {tab.badge}
              </span>
            ) : null}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-600 rounded-t-full"></div>}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'bookings' && (
          <div className="space-y-8 animate-fade-in">
            {bookings.length > 0 && bookings.some(b => b.status === BookingStatus.PENDING) && (
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center gap-4 text-amber-700">
                 <div className="p-3 bg-white rounded-xl shadow-sm"><AlertCircle size={20}/></div>
                 <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed">Certaines de vos réservations sont en attente. Elles s'afficheront dans votre calendrier dès que l'hôte les aura validées.</p>
              </div>
            )}
            
            {bookings.length === 0 && (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                 <Compass size={48} className="text-brand-200 mb-4" />
                 <p className="text-gray-400 font-bold text-xl uppercase tracking-widest">Aucune aventure à l'horizon</p>
                 <button onClick={() => navigate('/')} className="mt-8 bg-gray-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-brand-600 transition-all">
                    Découvrir de nouvelles aventures
                 </button>
              </div>
            )}
            
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center shadow-sm hover:shadow-2xl transition-all duration-500 group">
                  <div className="flex gap-8 items-center w-full lg:w-auto">
                    <div className="h-28 w-28 rounded-[2rem] bg-gray-100 overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                      <img src={booking.experience?.images[0]} alt="thumb" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-gray-900 text-2xl mb-1 leading-tight group-hover:text-brand-600 transition-colors">{booking.experience?.title}</h3>
                      <div className="text-xs flex items-center gap-1.5 mb-4">
                        <span className="text-gray-400 font-bold uppercase tracking-widest">hôte</span>
                        <button onClick={() => { setProfileData(getPartnerById(booking.experience.partnerId)); setProfileModalOpen(true); }} className="font-black text-brand-600 hover:underline">{booking.experience?.partnerName || "Partenaire"}</button>
                      </div>
                      <div className="flex flex-wrap items-center text-[10px] font-black text-gray-400 gap-3 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-4 py-2 rounded-2xl"><Calendar size={12} className="text-brand-500" /> {booking.date}</span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-4 py-2 rounded-2xl"><Clock size={12} className="text-brand-500" /> {booking.time}</span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-4 py-2 rounded-2xl"><UserIcon size={12} className="text-brand-500" /> {booking.adults} Ad. {booking.children > 0 && `, ${booking.children} Enf.`}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 lg:mt-0 flex flex-col items-end gap-4 w-full lg:w-auto">
                    <StatusBadge status={booking.status} />
                    <div className="flex gap-3 w-full lg:w-auto">
                        {booking.status === BookingStatus.COMPLETED && !booking.hasReviewed && (
                          <button onClick={() => handleOpenReview(booking)} className="flex-1 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                            <Star size={14} className="fill-yellow-600" /> Noter
                          </button>
                        )}
                        {booking.status === BookingStatus.PENDING && (
                          <button onClick={() => handleCancelBooking(booking.id)} className="flex-1 text-[10px] uppercase tracking-widest text-red-600 hover:bg-red-50 px-6 py-4 rounded-2xl font-black transition-all">Annuler</button>
                        )}
                        <button 
                          onClick={() => { setSelectedConversationId(CONVERSATIONS.find(c => c.partnerId === booking.experience.partnerId)?.id || null); setActiveTab('messages'); }} 
                          className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black shadow-lg shadow-gray-200 transition-all"
                        >
                          <MessageSquare size={14} /> Contacter
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && ( 
          <div className="animate-fade-in flex-1">
            <CalendarView 
              bookings={bookings.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED)} 
              role={UserRole.CLIENT} 
            />
          </div> 
        )}

        {activeTab === 'messages' && (
          <div className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-sm flex flex-1 h-[calc(100vh-280px)] min-h-[600px] animate-fade-in">
            {/* List */}
            <div className={`w-full md:w-1/3 border-r bg-gray-50/50 flex flex-col overflow-hidden ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
               <div className="p-8 border-b bg-white">
                  <h3 className="font-black text-2xl mb-4">Discussions</h3>
                  <div className="relative">
                     <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input 
                       type="text" 
                       placeholder="Rechercher..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner" 
                     />
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto no-scrollbar">
                  {filteredConversations.map(c => (
                     <div 
                      key={c.id} 
                      onClick={() => setSelectedConversationId(c.id)}
                      className={`p-6 border-b cursor-pointer transition-all ${selectedConversationId === c.id ? 'bg-white shadow-inner border-l-8 border-l-brand-600' : 'hover:bg-white/60'}`}
                     >
                       <div className="flex gap-5">
                          <div className="h-14 w-14 rounded-[1.25rem] bg-brand-50 flex items-center justify-center font-black text-brand-600 text-xl shadow-sm flex-shrink-0">
                             {c.partner.companyName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-baseline mb-1">
                                <h4 className={`font-black text-sm truncate uppercase tracking-tighter ${c.unreadCount > 0 ? 'text-gray-900' : 'text-gray-600'}`}>{c.partner.companyName}</h4>
                                {c.unreadCount > 0 && <span className="bg-brand-500 h-2.5 w-2.5 rounded-full animate-pulse"></span>}
                             </div>
                             <p className={`text-xs truncate ${c.unreadCount > 0 ? 'text-gray-900 font-black' : 'text-gray-400 font-medium'}`}>{c.lastMessage}</p>
                          </div>
                       </div>
                     </div>
                  ))}
                  {filteredConversations.length === 0 && (
                    <div className="p-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Aucune discussion</div>
                  )}
               </div>
            </div>

            {/* Chat Content */}
            <div className={`flex-1 flex flex-col bg-white ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
              {selectedConversationId && currentPartner ? (
                 <>
                   <div className="p-8 border-b flex items-center justify-between bg-white shadow-sm z-10">
                      <div className="flex items-center gap-4">
                         <button onClick={() => setSelectedConversationId(null)} className="md:hidden p-2 text-gray-400"><XCircle size={24}/></button>
                         <div className="h-14 w-14 rounded-[1.25rem] bg-brand-50 flex items-center justify-center font-black text-brand-600 shadow-sm">{currentPartner.companyName[0]}</div>
                         <div className="min-w-0">
                            <h3 className="font-black text-xl leading-tight truncate">{currentPartner.companyName}</h3>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{currentPartner.city}</p>
                         </div>
                      </div>
                      <button onClick={() => { setProfileData(currentPartner); setProfileModalOpen(true); }} className="text-[10px] font-black uppercase tracking-widest bg-gray-50 px-6 py-2.5 rounded-2xl hover:bg-gray-100 transition-colors">Profil Hôte</button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-gray-50/20 no-scrollbar">
                      {currentMessages.map(m => (
                         <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-8 py-5 rounded-[2.5rem] shadow-sm text-sm font-bold ${m.senderId === user.id ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border'}`}>
                               {m.content}
                               <div className={`text-[9px] mt-2 font-black uppercase tracking-widest ${m.senderId === user.id ? 'text-brand-200 text-right' : 'text-gray-400'}`}>
                                  {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </div>
                            </div>
                         </div>
                      ))}
                      <div ref={messagesEndRef} />
                   </div>
                   <form onSubmit={handleSendMessage} className="p-10 border-t bg-white flex gap-5">
                      <input 
                        value={messageInput} 
                        onChange={e => setMessageInput(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className="flex-1 bg-gray-100 border-none rounded-[1.5rem] py-5 px-8 font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner"
                      />
                      <button type="submit" disabled={!messageInput.trim()} className="bg-brand-600 text-white p-5 rounded-[1.5rem] font-black disabled:opacity-50 shadow-xl shadow-brand-100 hover:scale-105 active:scale-95 transition-all"><Send size={24}/></button>
                   </form>
                 </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-200">
                  <MessageSquare size={100} strokeWidth={1} className="mb-6 opacity-10" />
                  <p className="font-black text-2xl opacity-10 uppercase tracking-widest">Choisissez une conversation</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
