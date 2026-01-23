
import React, { useState, useEffect, useMemo } from 'react';
import { EXPERIENCES, PARTNERS } from '../services/mockData';
import { PartnerStatus, UserRole } from '../types';
import { Filter, Map as MapIcon, Star, MapPin, MessageSquare, Search as SearchIcon, X, DollarSign, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [priceRange, setPriceRange] = useState<number>(location.state?.maxPrice || 3000);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  
  useEffect(() => {
    if (location.state?.city && location.state.city !== 'all') {
      setSelectedCity(location.state.city);
    }
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location.state]);

  const categories = ['Aventure', 'Culture', 'Gastronomie', 'Désert', 'Sport', 'Bien-être'];

  // Histogram simulation data
  const histogramData = [30, 50, 80, 60, 40, 25, 15, 10, 5, 8, 12, 10, 5, 3, 2];

  // Only show experiences from ACTIVE partners
  const activePartnerIds = PARTNERS.filter(p => p.status === PartnerStatus.ACTIF).map(p => p.id);
  const activeExperiences = EXPERIENCES.filter(e => activePartnerIds.includes(e.partnerId));

  const filteredExperiences = activeExperiences.filter(exp => {
    const matchPrice = exp.price <= priceRange;
    const matchCat = selectedCategory === 'all' || exp.category === selectedCategory;
    const cityTerm = selectedCity.toLowerCase();
    const locationTerm = exp.location.toLowerCase();
    const matchCity = selectedCity === 'all' || locationTerm.includes(cityTerm) || (cityTerm === 'marrakech' && locationTerm === 'ourika');
    return matchPrice && matchCat && matchCity;
  });

  const handleContact = (e: React.MouseEvent, partnerId: string) => {
    e.stopPropagation();
    if (!user) {
        alert("Veuillez vous connecter pour contacter ce partenaire.");
        return;
    }
    navigate('/client/dashboard', { state: { activeTab: 'messages', startConversationWith: partnerId } });
  };

  const showContactButton = !user || user.role === UserRole.CLIENT;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-12 pt-28">
      {/* Sidebar Filters */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="sticky top-28 space-y-10 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-xl tracking-tighter flex items-center gap-3"><Filter size={18} className="text-brand-600"/> Filtres</h3>
              {(selectedCategory !== 'all' || selectedCity !== 'all' || priceRange < 3000) && (
                <button 
                  onClick={() => {setSelectedCategory('all'); setSelectedCity('all'); setPriceRange(3000);}}
                  className="text-[9px] text-brand-600 font-black uppercase tracking-widest hover:underline"
                >
                  Réinitialiser
                </button>
              )}
           </div>

          <div className="space-y-10">
            {/* City Search */}
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Destination</label>
              <div className="relative">
                <SearchIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text"
                  value={selectedCity === 'all' ? '' : selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value || 'all')}
                  placeholder="Rechercher une ville..."
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Price Slicer with Histogram */}
            <div>
              <div className="flex justify-between items-end mb-6">
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">Budget Max</label>
                <span className="text-brand-600 font-black text-xl tracking-tighter">{priceRange} <span className="text-[10px]">MAD</span></span>
              </div>
              
              {/* Simple Histogram UI */}
              <div className="flex items-end gap-1 h-12 mb-2 px-1">
                 {histogramData.map((val, idx) => (
                   <div 
                    key={idx} 
                    className={`flex-1 rounded-t-sm transition-all duration-500 ${ (idx / histogramData.length) * 3000 <= priceRange ? 'bg-brand-500' : 'bg-gray-100' }`} 
                    style={{ height: `${val}%` }} 
                   />
                 ))}
              </div>
              
              <input 
                type="range" min="0" max="3000" step="50" 
                value={priceRange} 
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-600 mb-6"
              />

              <div className="flex flex-wrap gap-2">
                 {[
                   { label: 'Éco', val: 500 },
                   { label: 'Mid', val: 1200 },
                   { label: 'Lux', val: 2500 }
                 ].map(chip => (
                   <button 
                    key={chip.label}
                    onClick={() => setPriceRange(chip.val)}
                    className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${priceRange === chip.val ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                   >
                     {chip.label}
                   </button>
                 ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Catégories</label>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'all' ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  Tout
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 min-w-0">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tighter">
              {filteredExperiences.length} Résultats<span className="text-brand-600">.</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">
              {selectedCategory !== 'all' ? `${selectedCategory} ` : 'Expériences '}
              {selectedCity !== 'all' ? `à ${selectedCity} ` : 'partout au Maroc '}
              {priceRange < 3000 && `• Max ${priceRange} MAD`}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {filteredExperiences.map(exp => (
            <div key={exp.id} onClick={() => navigate(`/experience/${exp.id}`)} className="group bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer flex flex-col">
              <div className="relative h-72 overflow-hidden">
                <img src={exp.images[0]} alt={exp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-600 shadow-sm">
                  {exp.category}
                </div>
                {showContactButton && (
                  <button 
                    onClick={(e) => handleContact(e, exp.partnerId)}
                    className="absolute top-6 right-6 bg-black/50 backdrop-blur-md hover:bg-brand-600 text-white p-3.5 rounded-2xl transition-all duration-300 border border-white/20"
                  >
                    <MessageSquare size={16} />
                  </button>
                )}
              </div>
              <div className="p-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1.5 text-sm font-black text-gray-900">
                      <Star size={16} className="fill-brand-600 text-brand-600" /> {exp.rating} 
                  </div>
                  <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin size={14} className="text-brand-500" /> {exp.location}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-8 line-clamp-2 leading-tight tracking-tighter group-hover:text-brand-600 transition-colors flex-1">{exp.title}</h3>
                
                <div className="flex justify-between items-end pt-8 border-t border-gray-50">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={14} className="text-brand-500"/> Prix / Pers.
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-black text-gray-400 uppercase mb-1">Dès</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">{exp.price} <span className="text-xs font-bold opacity-30">MAD</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredExperiences.length === 0 && (
            <div className="col-span-full text-center py-32 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
              <div className="p-6 bg-white rounded-3xl shadow-sm mb-6"><Filter size={32} className="text-gray-200" /></div>
              <p className="text-gray-400 font-black uppercase text-[11px] tracking-widest mb-4">Aucune aventure ne correspond à vos filtres</p>
              <button 
                onClick={() => {setSelectedCategory('all'); setSelectedCity('all'); setPriceRange(3000);}}
                className="text-brand-600 font-black uppercase text-[10px] tracking-widest hover:underline"
              >
                Tout réinitialiser
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
