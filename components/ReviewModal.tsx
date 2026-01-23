import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceName: string;
  onSubmit: (rating: number, comment: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, experienceName, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Veuillez sélectionner une note.");
      return;
    }
    onSubmit(rating, comment);
    setRating(0);
    setComment('');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-slide-up">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-xl text-gray-900">Donnez votre avis</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-gray-500 text-sm">Comment s'est passée votre expérience :</p>
            <h3 className="font-bold text-lg text-brand-600">"{experienceName}"</h3>
          </div>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform active:scale-90 hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  size={48}
                  className={`${
                    star <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Votre commentaire (optionnel)</label>
            <textarea
              className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:ring-2 focus:ring-brand-500 min-h-[120px] transition-all"
              placeholder="Racontez-nous ce que vous avez aimé..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
          >
            <Send size={18} />
            Publier mon avis
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;