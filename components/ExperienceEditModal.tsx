
import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { Experience } from '../types';

interface ExperienceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience: Experience;
  onSave: (id: string, updates: Partial<Experience>) => void;
}

const ExperienceEditModal: React.FC<ExperienceEditModalProps> = ({ isOpen, onClose, experience, onSave }) => {
  const [formData, setFormData] = useState<Partial<Experience>>({ ...experience });
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    setFormData({ ...experience });
  }, [experience]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.images || formData.images.length === 0) {
      alert("Une photo au minimum est obligatoire.");
      return;
    }
    onSave(experience.id, formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'maxGuests' ? Number(value) : value
    }));
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      if (!newImageUrl.startsWith('http')) {
        alert("Veuillez entrer une URL valide");
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
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 animate-slide-up max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
          <div>
            <h2 className="font-black text-2xl text-gray-900 tracking-tighter">Modifier l'offre</h2>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">ID: {experience.id}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-200 rounded-2xl transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-10 space-y-10 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Titre de l'expérience</label>
                <input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Prix (MAD)</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Durée</label>
                  <input 
                    name="duration" 
                    value={formData.duration} 
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Catégorie</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none"
                >
                  <option>Aventure</option>
                  <option>Culture</option>
                  <option>Gastronomie</option>
                  <option>Désert</option>
                  <option>Sport</option>
                  <option>Bien-être</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Lieu</label>
                <input 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none"
                />
              </div>
              
              {/* Gestion des photos */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
                   Photos (min 1 obligatoire)
                </label>
                <div className="flex gap-2 mb-4">
                  <input 
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="URL de l'image..."
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 font-bold outline-none text-sm"
                  />
                  <button type="button" onClick={addImage} className="p-2 bg-gray-900 text-white rounded-xl hover:scale-105 transition-all">
                    <Plus size={20}/>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {formData.images?.map((img, i) => (
                     <div key={i} className="relative group aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button type="button" onClick={() => removeImage(i)} className="text-white hover:text-brand-500">
                              <Trash2 size={18}/>
                           </button>
                        </div>
                     </div>
                   ))}
                   {(!formData.images || formData.images.length === 0) && (
                     <div className="col-span-2 py-6 border-2 border-dashed border-red-200 bg-red-50 rounded-2xl flex flex-col items-center justify-center text-red-400 gap-1">
                        <ImageIcon size={24}/>
                        <span className="text-[8px] font-black uppercase tracking-widest">Une photo est requise</span>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-600 font-black uppercase text-[10px] tracking-widest py-5 rounded-3xl hover:bg-gray-200 transition-all"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={!formData.images || formData.images.length === 0}
              className="flex-[2] bg-brand-600 text-white font-black uppercase text-[10px] tracking-widest py-5 rounded-3xl shadow-xl shadow-brand-100 hover:bg-brand-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Save size={18}/> Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExperienceEditModal;
