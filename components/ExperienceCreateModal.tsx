
import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Image as ImageIcon, MapPin, Clock, Tag, Info, Link as LinkIcon } from 'lucide-react';
import { Experience } from '../types';

interface ExperienceCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experience: Experience) => void;
  partnerId: string;
}

const ExperienceCreateModal: React.FC<ExperienceCreateModalProps> = ({ isOpen, onClose, onSave, partnerId }) => {
  const [formData, setFormData] = useState<Partial<Experience>>({
    title: '',
    category: 'Aventure',
    price: 0,
    duration: '',
    location: '',
    description: '',
    images: [], // Commence vide pour forcer l'ajout
    included: [],
    isActive: true,
    rating: 5.0,
    reviewsCount: 0,
    views: 0,
    maxGuests: 10
  });

  const [newItem, setNewItem] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.images || formData.images.length === 0) {
      alert("Une photo au minimum est obligatoire pour publier l'offre.");
      return;
    }
    const newExp: Experience = {
      ...formData as Experience,
      id: `e${Date.now()}`,
      partnerId: partnerId,
    };
    onSave(newExp);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'maxGuests' ? Number(value) : value
    }));
  };

  const addIncludedItem = () => {
    if (newItem.trim()) {
      setFormData(prev => ({
        ...prev,
        included: [...(prev.included || []), newItem.trim()]
      }));
      setNewItem('');
    }
  };

  const removeIncludedItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      included: prev.included?.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      // Simple URL validation
      if (!newImageUrl.startsWith('http')) {
        alert("Veuillez entrer une URL valide (commençant par http)");
        return;
      }
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-5xl overflow-hidden relative z-10 animate-slide-up max-h-[90vh] flex flex-col border border-gray-100">
        <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
          <div>
            <h2 className="font-black text-3xl text-gray-900 tracking-tighter">Nouvelle Aventure.</h2>
            <p className="text-[10px] font-black uppercase text-brand-600 tracking-widest mt-1">Chaque expérience doit avoir au moins une photo</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-gray-200 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-12 space-y-12 no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><Tag size={14}/> Titre de l'expérience</label>
                <input 
                  required
                  name="title" 
                  placeholder="Ex: Nuit magique dans le désert d'Agafay"
                  value={formData.title} 
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 font-black text-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">💰 Prix par personne (MAD)</label>
                  <input 
                    required
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 font-black text-xl outline-none focus:border-brand-500 transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><Clock size={14}/> Durée estimée</label>
                  <input 
                    required
                    name="duration" 
                    placeholder="Ex: 4 Heures, 2 Jours..."
                    value={formData.duration} 
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 font-black text-xl outline-none focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">📝 Description de l'aventure</label>
                <textarea 
                  required
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange}
                  rows={6}
                  placeholder="Décrivez ce qui rend votre expérience unique..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 font-bold outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all resize-none text-lg leading-relaxed"
                />
              </div>
            </div>

            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">📁 Catégorie</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 font-black text-lg outline-none cursor-pointer focus:border-brand-500 transition-all appearance-none"
                  >
                    <option>Aventure</option>
                    <option>Culture</option>
                    <option>Gastronomie</option>
                    <option>Désert</option>
                    <option>Sport</option>
                    <option>Bien-être</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><MapPin size={14}/> Lieu exact</label>
                  <input 
                    required
                    name="location" 
                    placeholder="Ex: Marrakech, Atlas..."
                    value={formData.location} 
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 font-black text-lg outline-none focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Gestion des Images */}
              <div className="space-y-6">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <ImageIcon size={14}/> Photos (URL obligatoires - min 1)
                </label>
                <div className="flex gap-4">
                   <input 
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Lien vers une photo (Unsplash...)"
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-brand-500 transition-all"
                   />
                   <button 
                    type="button" 
                    onClick={addImage}
                    className="bg-gray-900 text-white p-4 rounded-2xl hover:scale-105 transition-all shadow-lg"
                   >
                    <Plus size={24}/>
                   </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   {formData.images?.map((img, i) => (
                     <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button type="button" onClick={() => removeImage(i)} className="text-white hover:text-brand-500 transition-colors">
                              <Trash2 size={20}/>
                           </button>
                        </div>
                     </div>
                   ))}
                   {(!formData.images || formData.images.length === 0) && (
                     <div className="col-span-3 py-10 border-2 border-dashed border-red-200 bg-red-50/30 rounded-[2rem] flex flex-col items-center justify-center text-red-400 gap-2">
                        <ImageIcon size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Ajoutez une photo pour continuer</p>
                     </div>
                   )}
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">✅ Services inclus</label>
                <div className="flex gap-4">
                   <input 
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Ex: Transport, Déjeuner..."
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-brand-500 transition-all"
                   />
                   <button 
                    type="button" 
                    onClick={addIncludedItem}
                    className="bg-gray-900 text-white p-4 rounded-2xl hover:scale-105 transition-all shadow-lg"
                   >
                    <Plus size={24}/>
                   </button>
                </div>
                <div className="flex flex-wrap gap-3">
                   {formData.included?.map((item, i) => (
                     <div key={i} className="bg-brand-50 text-brand-600 px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3 border border-brand-100">
                        {item}
                        <button type="button" onClick={() => removeIncludedItem(i)} className="hover:text-red-500"><X size={14}/></button>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-6 pt-12 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-500 font-black uppercase text-[11px] tracking-[0.2em] py-8 rounded-[2rem] hover:bg-gray-200 transition-all"
            >
              Abandonner
            </button>
            <button 
              type="submit"
              disabled={!formData.images || formData.images.length === 0}
              className="flex-[2] bg-brand-600 text-white font-black uppercase text-[11px] tracking-[0.2em] py-8 rounded-[2rem] shadow-2xl shadow-brand-100 hover:bg-brand-700 transition-all flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save size={20}/> Publier mon offre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExperienceCreateModal;
