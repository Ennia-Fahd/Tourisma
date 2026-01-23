
import { User, Partner, Experience, Booking, BookingStatus, PartnerStatus, UserRole, Message, Conversation, Review } from '../types';

export const SUPPORT_PARTNER_ID = 'p0';

// --- Helpers for Dynamic Dates ---
const getDateString = (dayOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFixedDateString = (day: number) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${month}-${d}`;
};

// --- Mock Data ---

export const USERS: User[] = [
  { id: 'u1', name: 'Karim Alaoui', email: 'karim@test.com', role: UserRole.CLIENT, avatarUrl: 'https://picsum.photos/id/1005/100/100' },
  { id: 'u2', name: 'Sophie Martin', email: 'sophie@test.com', role: UserRole.PARTNER },
  { id: 'u3', name: 'Youssef Admin', email: 'admin@tourisma.ma', role: UserRole.ADMIN },
  { id: 'u4', name: 'Ahmed Guide', email: 'ahmed@desert.com', role: UserRole.PARTNER },
  { id: 'u5', name: 'Mouna Surf', email: 'mouna@essaouira.com', role: UserRole.PARTNER },
];

export const PARTNERS: Partner[] = [
  { id: SUPPORT_PARTNER_ID, userId: 'u3', companyName: 'Service Technique Tourisma', description: 'Support officiel de la plateforme.', city: 'Marrakech', phone: '+212 524 000 000', status: PartnerStatus.ACTIF, joinDate: '2023-01-01', rating: 5.0 },
  { id: 'p1', userId: 'u2', companyName: 'Atlas Trekking & Co', description: 'Spécialiste des randonnées dans le Haut Atlas depuis 10 ans.', city: 'Marrakech', phone: '+212 600 000 000', status: PartnerStatus.ACTIF, joinDate: '2023-01-15', rating: 4.8 },
  { id: 'p2', userId: 'u4', companyName: 'Agafay Luxury Camp', description: 'Vivez la magie du désert de pierre avec un confort 5 étoiles.', city: 'Agafay', phone: '+212 611 111 111', status: PartnerStatus.ACTIF, joinDate: '2023-03-10', rating: 4.9 },
  { id: 'p3', userId: 'u5', companyName: 'Mogador Surf School', description: 'École de surf et kitesurf sur la plage principale d\'Essaouira.', city: 'Essaouira', phone: '+212 633 333 333', status: PartnerStatus.ACTIF, joinDate: '2023-06-20', rating: 4.7 },
  { id: 'p4', userId: 'u5', companyName: 'Fes Heritage Tours', description: 'Guides officiels pour explorer la plus grande médina du monde.', city: 'Fès', phone: '+212 644 444 444', status: PartnerStatus.ACTIF, joinDate: '2023-08-15', rating: 4.9 }
];

export const EXPERIENCES: Experience[] = [
  { id: 'e1', partnerId: 'p1', title: 'Randonnée vallée de l\'Ourika et 7 cascades', category: 'Aventure', description: 'Une journée complète pour explorer la magnifique vallée de l\'Ourika, rencontrer les habitants berbères et grimper voir les 7 cascades.', price: 450, duration: '1 Jour', location: 'Marrakech', images: ['https://picsum.photos/id/1036/800/600', 'https://picsum.photos/id/1015/800/600'], maxGuests: 12, rating: 4.7, reviewsCount: 124, isActive: true, included: ['Transport A/R', 'Guide local', 'Déjeuner traditionnel'], views: 1450 },
  { id: 'e2', partnerId: 'p2', title: 'Dîner spectacle sous les étoiles à Agafay', category: 'Désert', description: 'Profitez d\'un coucher de soleil inoubliable suivi d\'un dîner gastronomique marocain sous une tente nomade de luxe.', price: 800, duration: '6 Heures', location: 'Agafay', images: ['https://picsum.photos/id/1022/800/600'], maxGuests: 30, rating: 4.9, reviewsCount: 85, isActive: true, included: ['Transport privé', 'Dîner 3 plats', 'Spectacle gnawa'], views: 2300 },
  { id: 'e3', partnerId: 'p1', title: 'Ascension du Mont Toubkal (2 Jours)', category: 'Sport', description: 'Le toit de l\'Afrique du Nord vous attend. Une expérience exigeante mais incroyablement gratifiante.', price: 1500, duration: '2 Jours', location: 'Imlil', images: ['https://picsum.photos/id/1018/800/600'], maxGuests: 6, rating: 5.0, reviewsCount: 12, isActive: true, included: ['Mule', 'Guide montagne', 'Hébergement refuge', 'Repas'], views: 890 }
];

export const REVIEWS: Review[] = [
  { id: 'r1', experienceId: 'e1', userId: 'u1', userName: 'Jean Dupont', rating: 5, comment: 'Incroyable journée ! Le guide était très instructif et les cascades sont magnifiques.', date: '2023-11-10' },
  { id: 'r2', experienceId: 'e1', userId: 'u5', userName: 'Sarah L.', rating: 4, comment: 'Très belle randonnée, un peu physique sur la fin mais ça en vaut la peine.', date: '2023-12-05' },
  { id: 'r3', experienceId: 'e2', userId: 'u1', userName: 'Karim A.', rating: 5, comment: 'Le cadre est magique, le dîner était succulent.', date: '2024-01-15' },
];

export const BOOKINGS: Booking[] = [
  { id: 'b1', experienceId: 'e1', clientId: 'u1', date: getFixedDateString(5), time: '09:00', adults: 2, children: 0, guests: 2, totalPrice: 900, status: BookingStatus.COMPLETED, createdAt: '2023-11-01', hasReviewed: true },
  { id: 'b2', experienceId: 'e2', clientId: 'u1', date: getFixedDateString(12), time: '18:30', adults: 2, children: 0, guests: 2, totalPrice: 1600, status: BookingStatus.CONFIRMED, createdAt: '2023-12-05' },
  { id: 'b3', experienceId: 'e1', clientId: 'u1', date: getFixedDateString(20), time: '10:00', adults: 1, children: 0, guests: 1, totalPrice: 450, status: BookingStatus.PENDING, createdAt: '2024-03-01' },
  { id: 'b4', experienceId: 'e3', clientId: 'u1', date: getFixedDateString(22), time: '08:00', adults: 2, children: 0, guests: 2, totalPrice: 3000, status: BookingStatus.CANCELLED, createdAt: '2024-03-02' },
];

export const CONVERSATIONS: Conversation[] = [
  { id: 'c1', clientId: 'u1', partnerId: 'p1', lastMessage: 'Est-ce que le déjeuner est végétarien ?', lastMessageDate: '2023-12-28T14:30:00' },
  { id: 'c_support_1', clientId: 'u1', partnerId: 'p0', lastMessage: 'J\'ai un problème avec mon paiement.', lastMessageDate: new Date().toISOString() }
];

export const MESSAGES: Message[] = [
  { id: 'm1', senderId: 'u2', receiverId: 'u1', content: 'Bonjour, pour la randonnée Ourika, est-ce que le déjeuner est végétarien ?', timestamp: '2023-12-28T14:30:00', read: false },
  { id: 'm_support_1', senderId: 'u1', receiverId: 'u3', content: 'Bonjour le support, j\'ai un problème avec mon paiement sur l\'expérience Ourika.', timestamp: new Date().toISOString(), read: false }
];

// --- Service Functions ---

export const getExperienceById = (id: string) => EXPERIENCES.find(e => e.id === id);
export const getPartnerById = (id: string) => PARTNERS.find(p => p.id === id);
export const getPartnerByUserId = (userId: string) => PARTNERS.find(p => p.userId === userId);
export const getUserById = (id: string) => USERS.find(u => u.id === id);
export const getReviewsByExperienceId = (id: string) => REVIEWS.filter(r => r.experienceId === id);

export const getUnreadMessagesCount = (userId: string) => {
  return MESSAGES.filter(m => m.receiverId === userId && !m.read).length;
};

export const markMessagesAsRead = (userId: string, otherUserId: string) => {
  MESSAGES.forEach(m => {
    if (m.receiverId === userId && m.senderId === otherUserId) {
      m.read = true;
    }
  });
};

export const closeConversation = (id: string) => {
  const index = CONVERSATIONS.findIndex(c => c.id === id);
  if (index !== -1) {
    CONVERSATIONS.splice(index, 1);
    return true;
  }
  return false;
};

export const addReview = (review: Omit<Review, 'id'>) => {
  const newReview = { ...review, id: `r${Date.now()}` };
  REVIEWS.unshift(newReview);
  
  // Update experience rating (mock update)
  const exp = EXPERIENCES.find(e => e.id === review.experienceId);
  if (exp) {
    const expReviews = REVIEWS.filter(r => r.experienceId === exp.id);
    const sum = expReviews.reduce((acc, curr) => acc + curr.rating, 0);
    exp.rating = parseFloat((sum / expReviews.length).toFixed(1));
    exp.reviewsCount = expReviews.length;
  }
  return newReview;
};

export const getClientBookings = (clientId: string) => {
  return BOOKINGS.filter(b => b.clientId === clientId).map(b => {
    const experience = getExperienceById(b.experienceId);
    return { ...b, experience };
  });
};

export const getPartnerBookings = (partnerId: string) => {
  const experienceIds = EXPERIENCES.filter(e => e.partnerId === partnerId).map(e => e.id);
  return BOOKINGS.filter(b => experienceIds.includes(b.experienceId)).map(b => {
     const client = getUserById(b.clientId);
     const experience = getExperienceById(b.experienceId);
     return { ...b, client, experienceName: experience?.title };
  });
};

export const getAllBookings = () => {
  return BOOKINGS.map(b => {
    const client = getUserById(b.clientId);
    const experience = getExperienceById(b.experienceId);
    const partner = experience ? getPartnerById(experience.partnerId) : undefined;
    return { ...b, client, experience, experienceName: experience?.title, partnerName: partner?.companyName };
  });
};

export const createBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>): Booking => {
  const newBooking: Booking = {
    ...bookingData,
    id: `b${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0]
  };
  BOOKINGS.unshift(newBooking); // Ajout en début de liste
  return newBooking;
};

export const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
  const booking = BOOKINGS.find(b => b.id === bookingId);
  if (booking) {
    booking.status = status;
    return true;
  }
  return false;
};

export const updatePartnerStatus = (partnerId: string, status: PartnerStatus) => {
  const partner = PARTNERS.find(p => p.id === partnerId);
  if (partner) {
    partner.status = status;
    return true;
  }
  return false;
};

export const updatePartner = (id: string, updates: Partial<Partner>) => {
  const index = PARTNERS.findIndex(p => p.id === id);
  if (index !== -1) {
    PARTNERS[index] = { ...PARTNERS[index], ...updates };
    return true;
  }
  return false;
};

export const updateExperience = (id: string, updates: Partial<Experience>) => {
  const index = EXPERIENCES.findIndex(e => e.id === id);
  if (index !== -1) {
    EXPERIENCES[index] = { ...EXPERIENCES[index], ...updates };
    return true;
  }
  return false;
};

export const addExperience = (experience: Experience) => {
  EXPERIENCES.push(experience);
  return experience;
};

export const sendMessage = (senderId: string, receiverId: string, content: string): Conversation | null => {
  const newMessage: Message = { id: `m${Date.now()}`, senderId, receiverId, content, timestamp: new Date().toISOString(), read: false };
  MESSAGES.push(newMessage);

  let partner = PARTNERS.find(p => p.userId === receiverId);
  let clientId = senderId;
  let partnerId = partner?.id;

  if (!partner) {
      partner = PARTNERS.find(p => p.userId === senderId);
      clientId = receiverId;
      partnerId = partner?.id;
  }
  
  if (partnerId) {
      let conversation = CONVERSATIONS.find(c => c.clientId === clientId && c.partnerId === partnerId);
      if (conversation) {
          conversation.lastMessage = content;
          conversation.lastMessageDate = newMessage.timestamp;
          return conversation;
      } else {
           const newConv: Conversation = { id: `c${Date.now()}`, clientId, partnerId, lastMessage: content, lastMessageDate: newMessage.timestamp };
          CONVERSATIONS.push(newConv);
          return newConv;
      }
  }
  return null;
};

export const initiateConversationWithWelcomeMessage = (clientId: string, partnerId: string, experienceTitle: string): string => {
    const partner = getPartnerById(partnerId);
    if (!partner) return '';
    let conversation = CONVERSATIONS.find(c => c.clientId === clientId && c.partnerId === partnerId);
    const welcomeMessage = `Bonjour, merci pour votre intérêt concernant l'expérience "${experienceTitle}". Je suis à votre disposition si vous avez des questions !`;
    if (!conversation) {
        conversation = { id: `c${Date.now()}`, clientId, partnerId, lastMessage: welcomeMessage, lastMessageDate: new Date().toISOString() };
        CONVERSATIONS.push(conversation);
    }
    MESSAGES.push({ id: `m_auto_${Date.now()}`, senderId: partner.userId, receiverId: clientId, content: welcomeMessage, timestamp: new Date().toISOString(), read: false });
    return conversation.id;
};

export const initializeSupportChat = (currentUser: User) => {
  const supportPartnerId = SUPPORT_PARTNER_ID;
  const supportUserId = 'u3';
  const existing = CONVERSATIONS.find(c => c.partnerId === supportPartnerId && c.clientId === currentUser.id);
  if (!existing) {
    let welcomeText = `Bonjour ${currentUser.name}, bienvenue sur Tourisma ! Une question sur une réservation ou une expérience ? Notre équipe est là pour vous.`;
    const timestamp = new Date().toISOString();
    CONVERSATIONS.unshift({ id: `c_support_${currentUser.id}`, partnerId: supportPartnerId, clientId: currentUser.id, lastMessage: welcomeText, lastMessageDate: timestamp });
    MESSAGES.push({ id: `m_init_${currentUser.id}`, senderId: supportUserId, receiverId: currentUser.id, content: welcomeText, timestamp: timestamp, read: false });
  }
};
