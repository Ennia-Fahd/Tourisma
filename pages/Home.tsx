
import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, Calendar, MapPin, ChevronRight, Star, MessageSquare, Clock, ArrowRight, Waves, Mountain, Baby, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EXPERIENCES, PARTNERS } from '../services/mockData';
import { PartnerStatus, UserRole } from '../types';
import { useAuth } from '../App';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState(1500);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/search', { state: { city: destination || 'all', maxPrice: budget } });
  };

  const categories = [
    { name: 'Aventure', img: 'https://images.unsplash.com/photo-1549488346-601267b2d556?auto=format&fit=crop&w=600&q=80', count: 12 },
    { name: 'Culture', img: 'https://images.unsplash.com/photo-1536236688223-2895f54366fb?auto=format&fit=crop&w=600&q=80', count: 8 },
    { name: 'Gastronomie', img: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?auto=format&fit=crop&w=600&q=80', count: 15 },
    { name: 'Désert', img: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=600&q=80', count: 5 },
    { name: 'Sport', img: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80', count: 10 },
    { name: 'Bien-être', img: 'https://images.unsplash.com/photo-1544161515-4af6b1d462c2?auto=format&fit=crop&w=600&q=80', count: 7 }
  ];

  // Filtrage des expériences dont le partenaire est actif
  const activePartnerIds = useMemo(() => PARTNERS.filter(p => p.status === PartnerStatus.ACTIF).map(p => p.id), []);
  const activeExperiences = useMemo(() => EXPERIENCES.filter(e => activePartnerIds.includes(e.partnerId)), [activePartnerIds]);

  return (
    <div className="bg-white">
      {/* Hero Section Immersive */}
      <div className="relative h-[95vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[15s] hover:scale-110"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=2000&q=80")' }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative h-full flex flex-col justify-center items-center px-6 text-center text-white pt-20">
          <h1 className="text-7xl md:text-[10rem] font-black mb-8 tracking-tighter leading-none animate-slide-up">
            L'Évasion<span className="text-brand-500">.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-16 max-w-2xl font-medium text-gray-100/90 drop-shadow-lg animate-slide-up animation-delay-200">
            Réservez les meilleures expériences locales au Maroc, vérifiées et authentiques.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-6xl bg-white rounded-[3.5rem] p-3 flex flex-col md:flex-row items-center gap-2 shadow-2xl border border-gray-100 animate-slide-up animation-delay-400">
            {/* Destination */}
            <div className="flex-1 flex items-center gap-4 w-full border-b md:border-b-0 border-gray-100 py-4 md:py-0 md:pl-10">
              <MapPin className="text-brand-600" size={24} />
              <div className="text-left flex-1">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination</div>
                <input 
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Où allez-vous ?"
                  className="w-full text-gray-900 outline-none bg-transparent font-black text-lg placeholder-gray-200"
                />
              </div>
            </div>
            
            <div className="w-px h-12 bg-gray-100 hidden md:block mx-2"></div>

            {/* Date */}
            <div className="flex-1 flex items-center gap-4 w-full border-b md:border-b-0 border-gray-100 py-4 md:py-0">
              <Calendar className="text-brand-600" size={24} />
              <div className="text-left flex-1">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</div>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-gray-900 outline-none bg-transparent font-black text-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="w-px h-12 bg-gray-100 hidden md:block mx-2"></div>

            {/* Budget (Slicer preview) */}
            <div className="flex-1 flex items-center gap-4 w-full border-b md:border-b-0 border-gray-100 py-4 md:py-0 pr-6">
              <DollarSign className="text-brand-600" size={24} />
              <div className="text-left flex-1">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Budget Max</div>
                <div className="flex items-center gap-3">
                   <input 
                    type="range" min="100" max="3000" step="100"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value))}
                    className="w-full accent-brand-600"
                   />
                   <span className="font-black text-gray-900 text-sm whitespace-nowrap">{budget} MAD</span>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full md:w-auto bg-gray-900 hover:bg-brand-600 text-white rounded-[2.5rem] py-6 px-16 font-black transition-all duration-500 flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] shadow-xl">
              <SearchIcon size={20} />
              <span>Rechercher</span>
            </button>
          </form>
        </div>
      </div>

      {/* Thématiques Card Grid */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Inspirations<span className="text-brand-600">.</span></h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
              L'excellence marocaine classée par passion
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
          {categories.map((cat, i) => (
            <div 
              key={i} 
              onClick={() => navigate('/search', { state: { category: cat.name } })} 
              className="group relative h-80 rounded-[3rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-4"
            >
              <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-white text-xl font-black tracking-tight mb-2">{cat.name}</h3>
                <span className="text-white/60 text-[9px] font-black uppercase tracking-widest">{cat.count} offres</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-gray-50/50 py-32 px-6 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Incontournables<span className="text-brand-600">.</span></h2>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                Les expériences les plus prisées du moment
              </p>
            </div>
            <button 
              onClick={() => navigate('/search')}
              className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-gray-900 hover:text-brand-600 transition-colors"
            >
              Voir tout le catalogue <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {activeExperiences.slice(0, 3).map((exp) => (
              <div key={exp.id} onClick={() => navigate(`/experience/${exp.id}`)} className="group bg-white rounded-[3.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-4xl transition-all duration-700 cursor-pointer flex flex-col h-full">
                <div className="relative h-80 overflow-hidden">
                  <img src={exp.images[0]} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest text-brand-600 shadow-lg">
                    {exp.category}
                  </div>
                  <div className="absolute bottom-6 right-6 bg-gray-900/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[10px] font-black flex items-center gap-2">
                    <Star size={14} className="fill-brand-500 text-brand-500" /> {exp.rating}
                  </div>
                </div>
                <div className="p-10 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6">
                    <MapPin size={14} className="text-brand-500" /> {exp.location}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-8 line-clamp-2 leading-none tracking-tighter group-hover:text-brand-600 transition-colors flex-1">{exp.title}</h3>
                  <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Clock size={16} className="text-brand-500" /> {exp.duration}
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] font-black text-gray-400 uppercase mb-1">Dès</span>
                      <span className="text-3xl font-black text-gray-900 tracking-tighter">{exp.price}<span className="text-xs ml-1 opacity-30">MAD</span></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
