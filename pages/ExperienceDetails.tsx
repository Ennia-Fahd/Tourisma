
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExperienceById, getPartnerById, getReviewsByExperienceId, initiateConversationWithWelcomeMessage, createBooking } from '../services/mockData';
import { UserRole, Review, BookingStatus } from '../types';
import { Star, MapPin, Clock, Users, CheckCircle, ShieldCheck, MessageSquare, Plus, Minus, ThumbsUp, Waves, Mountain, Baby } from 'lucide-react';
import { useAuth } from '../App';

const ExperienceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const experience = useMemo(() => getExperienceById(id || ''), [id]);
  const partner = useMemo(() => experience ? getPartnerById(experience.partnerId) : null, [experience]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (id) setReviews(getReviewsByExperienceId(id));
  }, [id]);

  if (!experience || !partner) return <div className="p-32 text-center font-black uppercase text-xs">Expérience introuvable</div>;

  const childPrice = Math.round(experience.price * 0.5);
  const totalPrice = (adults * experience.price) + (children * childPrice);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { alert("Veuillez vous connecter en tant que Voyageur pour réserver."); return; }
    
    setLoading(true);
    
    // On simule un délai réseau
    setTimeout(() => {
      // CRÉATION RÉELLE DE LA RÉSERVATION
      createBooking({
        experienceId: experience.id,
        clientId: user.id,
        date: date,
        time: "09:00", // Heure par défaut pour le mock
        adults: adults,
        children: children,
        guests: adults + children,
        totalPrice: totalPrice,
        status: BookingStatus.PENDING
      });
      
      setLoading(false);
      setShowConfirmation(true);
    }, 1500);
  };

  const handleContactPartner = () => {
    if (!user || user.role !== UserRole.CLIENT) { alert("Veuillez vous connecter en tant que Voyageur."); return; }
    const conversationId = initiateConversationWithWelcomeMessage(user.id, partner.id, experience.title);
    navigate('/client/dashboard', { state: { activeTab: 'messages', selectedConversationId: conversationId } });
  };

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Header Titre */}
      <div className="max-w-7xl mx-auto px-6 pt-32 mb-12">
        <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter">{experience.title}</h1>
        <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <span className="flex items-center gap-1.5 text-gray-900"><Star size={14} className="fill-brand-600 text-brand-600"/> {experience.rating} ({reviews.length} avis)</span>
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-500"/> {experience.location}</span>
          <span className="flex items-center gap-1.5"><Clock size={14} className="text-brand-500"/> {experience.duration}</span>
        </div>
      </div>

      {/* Grille Photo "Airbnb Style" */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px] rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="md:col-span-2 h-full"><img src={experience.images[0]} className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" alt="main" /></div>
          <div className="grid grid-rows-2 gap-4 h-full">
            <img src={experience.images[1] || experience.images[0]} className="w-full h-full object-cover hover:opacity-90" alt="2" />
            <img src={experience.images[2] || 'https://images.unsplash.com/photo-1549488346-601267b2d556'} className="w-full h-full object-cover hover:opacity-90" alt="3" />
          </div>
          <div className="grid grid-rows-2 gap-4 h-full">
            <img src={experience.images[3] || 'https://images.unsplash.com/photo-1536236688223-2895f54366fb'} className="w-full h-full object-cover hover:opacity-90" alt="4" />
            <img src={experience.images[4] || 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70'} className="w-full h-full object-cover hover:opacity-90" alt="5" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-20">
        <div className="lg:col-span-2 space-y-16">
          {/* Infos Hôte */}
          <div className="flex justify-between items-center py-10 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-black tracking-tighter mb-1 uppercase">Proposé par {partner.companyName}</h2>
              <p className="text-brand-600 font-black text-[9px] uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14}/> Partenaire Certifié Tourisma</p>
            </div>
            <div className="flex items-center gap-4">
                {user?.role === UserRole.CLIENT && (
                  <button onClick={handleContactPartner} className="px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Contacter</button>
                )}
                <div className="h-20 w-20 bg-brand-50 rounded-[2rem] flex items-center justify-center font-black text-brand-600 text-3xl shadow-inner">{partner.companyName[0]}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center gap-5">
                <div className="p-4 bg-white rounded-2xl text-brand-600 shadow-sm"><Mountain size={24}/></div>
                <div><h4 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-1">Cadre Idéal</h4><p className="font-black text-gray-900 uppercase">Vue Panoramique</p></div>
             </div>
             <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center gap-5">
                <div className="p-4 bg-white rounded-2xl text-brand-600 shadow-sm"><Baby size={24}/></div>
                <div><h4 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-1">Convivialité</h4><p className="font-black text-gray-900 uppercase">Kids Friendly</p></div>
             </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-3xl font-black tracking-tighter">L'expérience</h3>
             <p className="text-gray-600 leading-[1.8] font-medium text-lg whitespace-pre-wrap">{experience.description}</p>
          </div>
          
          <div className="pt-10 space-y-8">
             <h3 className="text-3xl font-black tracking-tighter">Ce qui est inclus</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experience.included.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-600 font-bold">
                    <CheckCircle size={18} className="text-green-500" /> {item}
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar Réservation Sticky */}
        <div className="relative">
          <div className="sticky top-32 bg-white border border-gray-100 rounded-[3.5rem] p-12 shadow-2xl shadow-gray-100 space-y-10">
            {!showConfirmation ? (
              <form onSubmit={handleBooking} className="space-y-10">
                <div className="flex justify-between items-baseline">
                   <span className="text-4xl font-black tracking-tighter">{experience.price} <span className="text-sm uppercase opacity-40">Mad</span></span>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">/ adulte</span>
                </div>
                
                <div className="bg-gray-50 rounded-[2rem] overflow-hidden divide-y divide-gray-100 border border-gray-100">
                   <div className="p-6">
                      <label className="block text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2">Date du séjour</label>
                      <input type="date" required className="w-full bg-transparent font-black text-sm outline-none cursor-pointer" onChange={e => setDate(e.target.value)} />
                   </div>
                   <div className="flex divide-x divide-gray-100">
                      <div className="p-6 w-1/2 space-y-3">
                         <div className="text-[9px] font-black uppercase text-gray-400 text-center">Adultes</div>
                         <div className="flex items-center justify-between">
                            <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="p-2 bg-white rounded-lg shadow-sm"><Minus size={12}/></button>
                            <span className="font-black text-lg">{adults}</span>
                            <button type="button" onClick={() => setAdults(adults + 1)} className="p-2 bg-white rounded-lg shadow-sm"><Plus size={12}/></button>
                         </div>
                      </div>
                      <div className="p-6 w-1/2 space-y-3">
                         <div className="text-[9px] font-black uppercase text-gray-400 text-center">Enfants</div>
                         <div className="flex items-center justify-between">
                            <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="p-2 bg-white rounded-lg shadow-sm"><Minus size={12}/></button>
                            <span className="font-black text-lg">{children}</span>
                            <button type="button" onClick={() => setChildren(children + 1)} className="p-2 bg-white rounded-lg shadow-sm"><Plus size={12}/></button>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>{experience.price} MAD × {adults} adultes</span>
                    <span>{experience.price * adults} MAD</span>
                  </div>
                  {children > 0 && (
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>{childPrice} MAD × {children} enfants</span>
                      <span>{childPrice * children} MAD</span>
                    </div>
                  )}
                  <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                     <span className="font-black text-gray-900 uppercase text-sm tracking-widest">Total</span>
                     <span className="text-3xl font-black text-gray-900">{totalPrice} <span className="text-xs">MAD</span></span>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-100 hover:bg-brand-700 transition-all flex justify-center items-center">
                   {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : "Réserver l'expérience"}
                </button>
              </form>
            ) : (
              <div className="text-center py-10 space-y-8 animate-fade-in">
                 <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-green-500 shadow-inner"><CheckCircle size={48} /></div>
                 <div>
                    <h3 className="font-black text-2xl tracking-tighter mb-2">Réservation envoyée !</h3>
                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest leading-relaxed">Le partenaire a été notifié. Retrouvez le détail dans votre dashboard.</p>
                 </div>
                 <button onClick={() => navigate('/client/dashboard')} className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">Gérer mes séjours</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetails;
