import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExperienceById, getPartnerById, USERS, initiateConversationWithWelcomeMessage } from '../services/mockData';
import { BookingStatus, UserRole } from '../types';
import { Star, MapPin, Clock, Users, CheckCircle, ShieldCheck, MessageSquare, Edit } from 'lucide-react';
import { useAuth } from '../App';

const ExperienceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const experience = getExperienceById(id || '');
  const partner = experience ? getPartnerById(experience.partnerId) : null;

  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!experience || !partner) {
    return <div className="p-20 text-center">Expérience introuvable</div>;
  }

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Veuillez vous connecter pour réserver (Utilisez le mode Démo dans le menu)");
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setShowConfirmation(true);
    }, 1500);
  };

  const handleContactPartner = () => {
    if (!user) {
        alert("Veuillez vous connecter en tant que Client pour envoyer un message.");
        return;
    }
    
    // Should typically be handled by visibility check, but extra safety
    if (user.role !== UserRole.CLIENT) {
        return;
    }

    // Trigger automatic welcome message from Partner to Client
    const conversationId = initiateConversationWithWelcomeMessage(user.id, partner.id, experience.title);

    // Suggested replies for the client
    const quickReplies = [
        "Est-ce que cette activité est adaptée aux enfants ?",
        "Proposez-vous des tarifs de groupe ?",
        "Est-ce que le transport est inclus depuis mon hôtel ?",
        `Est-ce disponible le ${new Date().toLocaleDateString()} ?`
    ];
    
    navigate('/client/dashboard', { 
        state: { 
            activeTab: 'messages', 
            selectedConversationId: conversationId,
            suggestedReplies: quickReplies
        } 
    });
  };

  // Only show contact button if User is logged in AND is a CLIENT
  const showContactButton = user && user.role === UserRole.CLIENT;

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Title Header */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{experience.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1"><Star size={14} className="fill-brand-600 text-brand-600"/> {experience.rating} ({experience.reviewsCount} avis)</span>
          <span>•</span>
          <span className="flex items-center gap-1"><MapPin size={14}/> {experience.location}</span>
          <span>•</span>
          <span className="font-medium text-brand-600">{experience.category}</span>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-96 rounded-2xl overflow-hidden">
          <div className="md:col-span-2 md:row-span-2">
            <img src={experience.images[0]} alt="Main" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="hidden md:block">
            <img src={experience.images[1] || experience.images[0]} alt="Secondary" className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:block">
            <img src={experience.images[2] || experience.images[0]} alt="Tertiary" className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:block md:col-span-2">
            <img src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?ixlib=rb-4.0.3" alt="Landscape" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          
          <div className="flex justify-between items-center py-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold mb-1">Proposé par {partner.companyName}</h2>
              <p className="text-gray-500 text-sm">Partenaire vérifié Tourisma depuis 2023</p>
            </div>
            <div className="flex items-center gap-4">
                {showContactButton && (
                    <button 
                        onClick={handleContactPartner}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full border border-gray-200 text-sm font-semibold transition-colors"
                    >
                        <MessageSquare size={16} /> Contacter l'hôte
                    </button>
                )}
                <div className="h-12 w-12 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
                   <img src={`https://ui-avatars.com/api/?name=${partner.companyName}&background=random`} alt={partner.companyName} />
                </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4">
             <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg text-center">
                <Clock className="mb-2 text-brand-600" />
                <span className="font-bold text-gray-900">{experience.duration}</span>
                <span className="text-xs text-gray-500">Durée</span>
             </div>
             <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg text-center">
                <Users className="mb-2 text-brand-600" />
                <span className="font-bold text-gray-900">1 - {experience.maxGuests}</span>
                <span className="text-xs text-gray-500">Invités</span>
             </div>
             <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg text-center">
                <ShieldCheck className="mb-2 text-brand-600" />
                <span className="font-bold text-gray-900">Assurance</span>
                <span className="text-xs text-gray-500">Incluse</span>
             </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">À propos de l'expérience</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{experience.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Ce qui est inclus</h2>
            <ul className="grid grid-cols-2 gap-3">
              {experience.included.map((inc, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600">
                  <CheckCircle size={18} className="text-green-500" /> {inc}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sticky Booking Sidebar */}
        <div className="relative">
          <div className="sticky top-24 bg-white border border-gray-200 shadow-xl rounded-2xl p-6">
            {!showConfirmation ? (
              <>
                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-2xl font-bold text-gray-900">{experience.price} MAD</span>
                  <span className="text-gray-500 text-sm">par personne</span>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="flex border-b border-gray-300">
                      <div className="p-3 w-2/3 border-r border-gray-300">
                        <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Date</label>
                        <input 
                          type="date" 
                          required
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full outline-none text-gray-600 text-sm"
                        />
                      </div>
                      <div className="p-3 w-1/3">
                        <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Heure</label>
                        <input 
                          type="time" 
                          required
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full outline-none text-gray-600 text-sm"
                        />
                      </div>
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Voyageurs</label>
                      <select 
                        value={guests} 
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                        className="w-full outline-none text-gray-600 text-sm bg-white"
                      >
                        {[...Array(experience.maxGuests).keys()].map(i => (
                          <option key={i+1} value={i+1}>{i+1} voyageurs</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 py-4">
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>{experience.price} MAD x {guests} voyageurs</span>
                      <span>{experience.price * guests} MAD</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Frais de service (0%)</span>
                      <span>0 MAD</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-100">
                      <span>Total</span>
                      <span>{experience.price * guests} MAD</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex justify-center items-center shadow-lg shadow-brand-200"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "Réserver"
                        )}
                      </button>
                      <p className="text-xs text-center text-gray-400">Aucun débit immédiat. Confirmation par le partenaire requise.</p>
                      
                      {user && user.id === partner.userId ? (
                           <div className="text-center p-3 bg-gray-50 rounded-xl border border-dashed text-gray-500 text-sm">
                               <Edit size={16} className="inline mr-2" />
                               Ceci est votre annonce
                           </div>
                      ) : (
                          showContactButton && (
                              <button 
                                type="button"
                                onClick={handleContactPartner}
                                className="w-full bg-white border-2 border-brand-100 text-brand-700 hover:bg-brand-50 hover:border-brand-200 font-bold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2"
                              >
                                 <MessageSquare size={18} />
                                 Contacter l'établissement
                              </button>
                          )
                      )}
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-600 h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Demande envoyée !</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Votre demande de réservation a été transmise à <strong>{partner.companyName}</strong>. 
                  Vous recevrez un email de confirmation dès validation.
                </p>
                <div className="space-y-3">
                  <button onClick={() => navigate('/client/dashboard')} className="w-full bg-gray-900 text-white font-bold py-2 rounded-lg">
                    Voir mes réservations
                  </button>
                  <button onClick={() => setShowConfirmation(false)} className="w-full text-gray-500 text-sm hover:underline">
                    Faire une nouvelle recherche
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetails;