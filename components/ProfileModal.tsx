import React from 'react';
import { X, MapPin, Mail, Phone, Star, ShieldCheck, Calendar, Globe } from 'lucide-react';
import { Partner, User, UserRole } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'CLIENT' | 'PARTNER';
  data: any; // User or Partner object
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, type, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 transform transition-all scale-100 animate-slide-up">
        
        {/* Header / Cover */}
        <div className="h-32 bg-gradient-to-r from-brand-600 to-morocco-ochre relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Avatar & Main Info */}
        <div className="px-8 pb-8 -mt-12 relative">
          <div className="flex justify-between items-end">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white overflow-hidden">
               {type === 'CLIENT' && data.avatarUrl ? (
                 <img src={data.avatarUrl} alt={data.name} className="w-full h-full object-cover" />
               ) : (
                 <img 
                    src={`https://ui-avatars.com/api/?name=${type === 'PARTNER' ? data.companyName : data.name}&background=random&size=128`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                 />
               )}
            </div>
            {type === 'PARTNER' && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 mb-2">
                    <ShieldCheck size={14} /> Vérifié
                </div>
            )}
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {type === 'PARTNER' ? data.companyName : data.name}
            </h2>
            <p className="text-gray-500 font-medium">
               {type === 'PARTNER' ? data.city : 'Membre Tourisma'}
            </p>

            {type === 'PARTNER' && (
                <div className="flex items-center gap-1 text-sm font-semibold mt-1">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" /> 
                    <span>{data.rating}</span>
                    <span className="text-gray-400 font-normal">({Math.floor(Math.random() * 100) + 10} avis)</span>
                </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 my-6"></div>

          {/* Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">À propos</h3>
            
            {type === 'PARTNER' && (
                <p className="text-gray-600 text-sm leading-relaxed">
                    {data.description || "Partenaire officiel proposant des expériences authentiques au Maroc."}
                </p>
            )}

            <div className="grid gap-3">
                {type === 'PARTNER' ? (
                    <>
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                <MapPin size={16} />
                            </div>
                            <span className="text-sm">{data.city}, Maroc</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                             <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                <Phone size={16} />
                             </div>
                            <a href={`tel:${data.phone}`} className="text-sm hover:text-brand-600 hover:underline">{data.phone}</a>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                <Globe size={16} />
                            </div>
                            <span className="text-sm">Membre depuis {new Date(data.joinDate).getFullYear()}</span>
                        </div>
                    </>
                ) : (
                    <>
                         <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                <Mail size={16} />
                            </div>
                            <a href={`mailto:${data.email}`} className="text-sm hover:text-brand-600 hover:underline">{data.email}</a>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                <Calendar size={16} />
                            </div>
                            <span className="text-sm">Inscrit en 2023</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                <ShieldCheck size={16} />
                            </div>
                            <span className="text-sm">Identité vérifiée</span>
                        </div>
                    </>
                )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-8">
            <button 
                onClick={onClose}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors"
            >
                Fermer
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;