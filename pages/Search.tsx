import React, { useState, useEffect } from 'react';
import { EXPERIENCES, PARTNERS } from '../services/mockData';
import { PartnerStatus, UserRole } from '../types';
import { Filter, Map as MapIcon, Star, MapPin, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [priceRange, setPriceRange] = useState<number>(3000);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  
  // Update city if coming from Home page state
  useEffect(() => {
    if (location.state?.city) {
      setSelectedCity(location.state.city);
    }
  }, [location.state]);

  const categories = ['Aventure', 'Culture', 'Gastronomie', 'Désert', 'Sport'];
  const cities = ['Marrakech', 'Agadir', 'Essaouira', 'Fès', 'Tanger', 'Chefchaouen', 'Casablanca', 'Merzouga', 'Ouarzazate', 'Imlil'];

  // Filter out suspended partners' experiences
  const activePartnerIds = PARTNERS.filter(p => p.status === PartnerStatus.ACTIF).map(p => p.id);
  const activeExperiences = EXPERIENCES.filter(e => activePartnerIds.includes(e.partnerId));

  const filteredExperiences = activeExperiences.filter(exp => {
    const matchPrice = exp.price <= priceRange;
    const matchCat = selectedCategory === 'all' || exp.category === selectedCategory;
    
    // Case insensitive search logic
    const cityTerm = selectedCity.toLowerCase();
    const locationTerm = exp.location.toLowerCase();
    
    const matchCity = selectedCity === 'all' || 
                      locationTerm.includes(cityTerm) || 
                      (cityTerm === 'marrakech' && locationTerm === 'ourika'); // Quick fix to include Ourika with Marrakech

    return matchPrice && matchCat && matchCity;
  });

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

  // Determine if contact button should be visible (Guests or Clients only)
  const showContactButton = !user || user.role === UserRole.CLIENT;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-1/4">
        <div className="sticky top-24 space-y-8">
           {/* Map Toggle (Mock) */}
           <div className="bg-morocco-blue/10 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-morocco-blue/20 transition text-morocco-blue">
            <span className="font-semibold">Afficher la carte</span>
            <MapIcon size={20} />
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Filter size={18}/> Filtres</h3>
            
            {/* Destination Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              {/* Changed to input to support text search from home properly, or can keep select if options match */}
              <input 
                type="text"
                value={selectedCity === 'all' ? '' : selectedCity}
                onChange={(e) => setSelectedCity(e.target.value || 'all')}
                placeholder="Ville ou région..."
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {cities.slice(0, 5).map(city => (
                  <button 
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-600"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    name="cat" 
                    id="all" 
                    checked={selectedCategory === 'all'} 
                    onChange={() => setSelectedCategory('all')}
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                  />
                  <label htmlFor="all" className="ml-2 text-sm text-gray-700">Toutes</label>
                </div>
                {categories.map(cat => (
                  <div key={cat} className="flex items-center">
                    <input 
                      type="radio" 
                      name="cat" 
                      id={cat} 
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                    />
                    <label htmlFor={cat} className="ml-2 text-sm text-gray-700">{cat}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix max: {priceRange} MAD</label>
              <input 
                type="range" 
                min="0" 
                max="3000" 
                step="100" 
                value={priceRange} 
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 MAD</span>
                <span>3000+ MAD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="w-full md:w-3/4">
        <h1 className="text-2xl font-bold mb-6">
          {filteredExperiences.length} Expériences trouvées 
          {selectedCity !== 'all' ? ` pour "${selectedCity}"` : ' au Maroc'}
        </h1>
        
        <div className="grid grid-cols-1 gap-6">
          {filteredExperiences.map(exp => (
            <div key={exp.id} onClick={() => navigate(`/experience/${exp.id}`)} className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col md:flex-row h-auto md:h-64 group relative">
              <div className="md:w-2/5 relative h-48 md:h-full overflow-hidden">
                <img src={exp.images[0]} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                  {exp.category}
                </div>
              </div>
              <div className="p-6 md:w-3/5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors pr-8">{exp.title}</h3>
                    {/* Action Buttons Top Right */}
                    <div className="flex items-center gap-1 absolute top-4 right-4 md:relative md:top-auto md:right-auto">
                        {showContactButton && (
                            <button 
                                onClick={(e) => handleContact(e, exp.partnerId)}
                                className="bg-gray-100 hover:bg-brand-50 text-gray-500 hover:text-brand-600 p-2 rounded-full transition-colors"
                                title="Contacter le partenaire"
                            >
                                <MessageSquare size={18} />
                            </button>
                        )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm font-semibold mb-3">
                      <Star size={14} className="fill-black text-black" /> {exp.rating} 
                      <span className="text-gray-400 font-normal ml-1">({exp.reviewsCount})</span>
                  </div>

                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">{exp.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    {exp.included.slice(0, 2).map((inc, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{inc}</span>
                    ))}
                    {exp.included.length > 2 && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">+{exp.included.length - 2}</span>}
                  </div>
                </div>
                
                <div className="flex justify-between items-end mt-4">
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                     <MapPin size={14} /> {exp.location} • {exp.duration}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">à partir de</div>
                    <div className="text-2xl font-bold text-gray-900">{exp.price} MAD</div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredExperiences.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg">Aucune expérience ne correspond à vos filtres.</p>
              <button onClick={() => {setPriceRange(3000); setSelectedCategory('all'); setSelectedCity('all')}} className="mt-4 text-brand-600 font-medium hover:underline">Réinitialiser les filtres</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;