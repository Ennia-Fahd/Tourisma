import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const BecomePartner = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to create partner would go here
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Demande envoyée !</h1>
        <p className="text-gray-600 max-w-lg mb-8">
          Votre dossier est entre les mains de notre équipe. Vous recevrez une réponse sous 24h. 
          Une fois validé, vous pourrez publier vos expériences.
        </p>
        <button onClick={() => navigate('/')} className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold">
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Devenez partenaire Tourisma</h1>
        <p className="text-lg text-gray-500">Rejoignez la première plateforme d'expériences locales au Maroc. Boostez vos réservations, simplifiez votre gestion.</p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border">
        <div className="bg-brand-50 p-6 border-b border-brand-100">
           <div className="flex items-center gap-4">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
             <div className="h-1 flex-1 bg-gray-200">
                <div className={`h-full bg-brand-600 transition-all ${step === 2 ? 'w-full' : 'w-0'}`}></div>
             </div>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold">Informations sur votre activité</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la structure / guide</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-brand-500" placeholder="Ex: Atlas Rando, Chez Fatima..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <select className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-brand-500">
                    <option>Marrakech</option>
                    <option>Agadir</option>
                    <option>Essaouira</option>
                    <option>Fès</option>
                    <option>Tanger</option>
                    <option>Chefchaouen</option>
                    <option>Casablanca</option>
                    <option>Rabat</option>
                    <option>Merzouga</option>
                    <option>Ouarzazate</option>
                    <option>Dakhla</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type d'activité</label>
                  <select className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-brand-500">
                    <option>Excursion / Randonnée</option>
                    <option>Cours de cuisine / Gastronomie</option>
                    <option>Surf / Sports nautiques</option>
                    <option>Quad / Buggy / Désert</option>
                    <option>Bien-être / Yoga</option>
                    <option>Visite Culturelle / Guide</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description courte</label>
                <textarea className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-brand-500 h-24" placeholder="Décrivez votre activité en quelques mots..."></textarea>
              </div>

              <button type="button" onClick={() => setStep(2)} className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition">Suivant</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold">Vos coordonnées</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input type="text" required className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input type="text" required className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-brand-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-brand-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="tel" required className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-brand-500" placeholder="+212..." />
              </div>
              
              <div className="flex gap-4">
                 <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition">Retour</button>
                 <button type="submit" className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition">Créer mon compte partenaire</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BecomePartner;