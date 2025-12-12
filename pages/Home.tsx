import React, { useState } from 'react';
import { Search as SearchIcon, Calendar, MapPin, ChevronRight, Star, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EXPERIENCES, PARTNERS } from '../services/mockData';
import { PartnerStatus, UserRole } from '../types';
import { useAuth } from '../App';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [destination, setDestination] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass the destination to the search page state
    navigate('/search', { state: { city: destination || 'all' } });
  };
  
  const handleContact = (e: React.MouseEvent, partnerId: string) => {
    e.stopPropagation();
    if (!user) {
        alert("Veuillez vous connecter (Mode Client) pour contacter ce partenaire.");
        return;
    }
    navigate('/client/dashboard', { 
        state: { 
            activeTab: 'messages', 
            startConversationWith: partnerId 
        } 
    });
  };

  // Filter out suspended partners' experiences for the featured section
  const activePartnerIds = PARTNERS.filter(p => p.status === PartnerStatus.ACTIF).map(p => p.id);
  const activeExperiences = EXPERIENCES.filter(e => activePartnerIds.includes(e.partnerId));

  // Determine if contact button should be visible (Guests or Clients only)
  const showContactButton = !user || user.role === UserRole.CLIENT;

  return (
    <div className="-mt-20">
      {/* Hero Section */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1539020140153-e479b8c22e70?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative h-full flex flex-col justify-center items-center px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight drop-shadow-lg">
            Vivez le Maroc pleinement
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl font-light text-gray-100 drop-shadow-md">
            Des montagnes de l'Atlas aux plages d'Essaouira. Organisez votre voyage de A à Z sur une plateforme locale 100% marocaine.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-4xl bg-white rounded-full p-2 pl-6 flex flex-col md:flex-row items-center gap-2 shadow-2xl animate-fade-in-up">
            <div className="flex-1 flex items-center gap-3 w-full border-b md:border-b-0 border-gray-100 py-2 md:py-0">
              <MapPin className="text-gray-400" />
              <div className="text-left w-full">
                <div className="text-xs font-bold text-gray-800 uppercase tracking-wider">Destination</div>
                <input 
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Où souhaitez-vous aller ?"
                  className="w-full text-gray-600 outline-none bg-transparent font-medium placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="w-px h-10 bg-gray-200 hidden md:block"></div>

            <div className="flex-1 flex items-center gap-3 w-full border-b md:border-b-0 border-gray-100 py-2 md:py-0">
              <Calendar className="text-gray-400" />
              <div className="text-left w-full">
                <div className="text-xs font-bold text-gray-800 uppercase tracking-wider">Quand ?</div>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-gray-600 outline-none bg-transparent"
                />
              </div>
            </div>

            <button type="submit" className="w-full md:w-auto bg-brand-600 hover:bg-brand-700 text-white rounded-full p-4 px-8 font-bold transition-all flex items-center justify-center gap-2">
              <SearchIcon size={20} />
              <span>Rechercher</span>
            </button>
          </form>
        </div>
      </div>

      {/* Categories */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-gray-900">Catégories populaires</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Aventure', img: 'https://images.unsplash.com/photo-1549488346-601267b2d556?auto=format&fit=crop&w=600&q=80' },
            { name: 'Culture', img: 'https://images.unsplash.com/photo-1536236688223-2895f54366fb?auto=format&fit=crop&w=600&q=80' },
            { name: 'Gastronomie', img: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?auto=format&fit=crop&w=600&q=80' },
            { name: 'Plage & Surf', img: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80' }
          ].map((cat, i) => (
            <div key={i} onClick={() => navigate('/search')} className="group relative h-64 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all">
              <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <h3 className="text-white text-xl font-bold">{cat.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Experiences */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Expériences à la une</h2>
              <p className="text-gray-500 mt-2">Les activités les mieux notées par les voyageurs</p>
            </div>
            <button onClick={() => navigate('/search')} className="hidden md:flex items-center text-brand-600 font-semibold hover:text-brand-700">
              Voir tout <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activeExperiences.slice(0, 3).map((exp) => (
              <div key={exp.id} onClick={() => navigate(`/experience/${exp.id}`)} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group relative">
                <div className="relative h-64 overflow-hidden">
                  <img src={exp.images[0]} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" /> {exp.rating}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wide">{exp.category}</span>
                    <span className="text-gray-400 text-xs flex items-center gap-1"><MapPin size={10} /> {exp.location}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">{exp.title}</h3>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">{exp.duration}</div>
                    <div className="flex items-center gap-2">
                        <div className="font-bold text-lg">{exp.price} MAD</div>
                        {/* Message Button on Card - Only visible to guests or clients */}
                        {showContactButton && (
                             <button 
                                onClick={(e) => handleContact(e, exp.partnerId)}
                                className="bg-gray-100 hover:bg-brand-50 text-gray-500 hover:text-brand-600 p-2 rounded-full transition-colors"
                                title="Contacter le partenaire"
                            >
                                <MessageSquare size={16} />
                            </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
             <button onClick={() => navigate('/search')} className="inline-flex items-center text-brand-600 font-semibold hover:text-brand-700">
              Voir toutes les expériences <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;