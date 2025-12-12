
import { User, Partner, Experience, Booking, BookingStatus, PartnerStatus, UserRole, Message, Conversation } from '../types';

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
  { id: 'u2', name: 'Sophie Martin', email: 'sophie@test.com', role: UserRole.PARTNER }, // Owner of Atlas Trekking
  { id: 'u3', name: 'Youssef Admin', email: 'admin@tourisma.ma', role: UserRole.ADMIN },
  { id: 'u4', name: 'Ahmed Guide', email: 'ahmed@desert.com', role: UserRole.PARTNER }, // Owner of Agafay Camp
  { id: 'u5', name: 'Mouna Surf', email: 'mouna@essaouira.com', role: UserRole.PARTNER },
];

export const PARTNERS: Partner[] = [
  { 
    id: SUPPORT_PARTNER_ID, 
    userId: 'u3', // Admin User ID
    companyName: 'Service Technique Tourisma', 
    description: 'Support officiel de la plateforme.', 
    city: 'Marrakech', 
    phone: '+212 524 000 000', 
    status: PartnerStatus.ACTIF,
    joinDate: '2023-01-01',
    rating: 5.0
  },
  { 
    id: 'p1', 
    userId: 'u2', 
    companyName: 'Atlas Trekking & Co', 
    description: 'Spécialiste des randonnées dans le Haut Atlas depuis 10 ans.', 
    city: 'Marrakech', 
    phone: '+212 600 000 000', 
    status: PartnerStatus.ACTIF,
    joinDate: '2023-01-15',
    rating: 4.8
  },
  { 
    id: 'p2', 
    userId: 'u4', 
    companyName: 'Agafay Luxury Camp', 
    description: 'Vivez la magie du désert de pierre avec un confort 5 étoiles.', 
    city: 'Agafay', 
    phone: '+212 611 111 111', 
    status: PartnerStatus.ACTIF,
    joinDate: '2023-03-10',
    rating: 4.9
  },
  {
    id: 'p3',
    userId: 'u5',
    companyName: 'Mogador Surf School',
    description: 'École de surf et kitesurf sur la plage principale d\'Essaouira.',
    city: 'Essaouira',
    phone: '+212 633 333 333',
    status: PartnerStatus.ACTIF,
    joinDate: '2023-06-20',
    rating: 4.7
  },
  {
    id: 'p4',
    userId: 'u5', // Reusing user for demo
    companyName: 'Fes Heritage Tours',
    description: 'Guides officiels pour explorer la plus grande médina du monde.',
    city: 'Fès',
    phone: '+212 644 444 444',
    status: PartnerStatus.ACTIF,
    joinDate: '2023-08-15',
    rating: 4.9
  }
];

export const EXPERIENCES: Experience[] = [
  {
    id: 'e1',
    partnerId: 'p1',
    title: 'Randonnée vallée de l\'Ourika et 7 cascades',
    category: 'Aventure',
    description: 'Une journée complète pour explorer la magnifique vallée de l\'Ourika, rencontrer les habitants berbères et grimper voir les 7 cascades.',
    price: 450,
    duration: '1 Jour',
    location: 'Marrakech',
    images: ['https://picsum.photos/id/1036/800/600', 'https://picsum.photos/id/1015/800/600', 'https://picsum.photos/id/1016/800/600'],
    maxGuests: 12,
    rating: 4.7,
    reviewsCount: 124,
    isActive: true,
    included: ['Transport A/R', 'Guide local', 'Déjeuner traditionnel']
  },
  {
    id: 'e2',
    partnerId: 'p2',
    title: 'Dîner spectacle sous les étoiles à Agafay',
    category: 'Désert',
    description: 'Profitez d\'un coucher de soleil inoubliable suivi d\'un dîner gastronomique marocain sous une tente nomade de luxe.',
    price: 800,
    duration: '6 Heures',
    location: 'Agafay',
    images: ['https://picsum.photos/id/1022/800/600', 'https://picsum.photos/id/1021/800/600'],
    maxGuests: 30,
    rating: 4.9,
    reviewsCount: 85,
    isActive: true,
    included: ['Transport privé', 'Dîner 3 plats', 'Spectacle gnawa']
  },
  {
    id: 'e3',
    partnerId: 'p1',
    title: 'Ascension du Mont Toubkal (2 Jours)',
    category: 'Sport',
    description: 'Le toit de l\'Afrique du Nord vous attend. Une expérience exigeante mais incroyablement gratifiante.',
    price: 1500,
    duration: '2 Jours',
    location: 'Imlil',
    images: ['https://picsum.photos/id/1018/800/600', 'https://picsum.photos/id/1019/800/600'],
    maxGuests: 6,
    rating: 5.0,
    reviewsCount: 12,
    isActive: true,
    included: ['Mule', 'Guide montagne', 'Hébergement refuge', 'Repas']
  },
  {
    id: 'e4',
    partnerId: 'p3',
    title: 'Cours de Surf initiation à Essaouira',
    category: 'Sport',
    description: 'Apprenez à surfer les vagues de l\'Atlantique avec des instructeurs certifiés. Matériel inclus.',
    price: 350,
    duration: '2 Heures',
    location: 'Essaouira',
    images: ['https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1537519646099-335112f03225?auto=format&fit=crop&w=800&q=80'],
    maxGuests: 8,
    rating: 4.8,
    reviewsCount: 42,
    isActive: true,
    included: ['Planche', 'Combinaison', 'Moniteur', 'Thé à la menthe']
  },
  {
    id: 'e5',
    partnerId: 'p4',
    title: 'Exploration secrète de la Médina de Fès',
    category: 'Culture',
    description: 'Perdez-vous intelligemment dans les 9000 ruelles de Fès el-Bali. Visite des tanneries, médersas et artisans.',
    price: 400,
    duration: '4 Heures',
    location: 'Fès',
    images: ['https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1556608529-4df33cc7408d?auto=format&fit=crop&w=800&q=80'],
    maxGuests: 10,
    rating: 4.9,
    reviewsCount: 210,
    isActive: true,
    included: ['Guide certifié', 'Frais d\'entrée Médersa', 'Dégustation']
  },
  {
    id: 'e6',
    partnerId: 'p1',
    title: 'La ville bleue : Excursion à Chefchaouen',
    category: 'Culture',
    description: 'Découvrez la perle bleue du Maroc. Une journée de dépaysement total dans les montagnes du Rif.',
    price: 600,
    duration: '1 Jour',
    location: 'Chefchaouen',
    images: ['https://images.unsplash.com/photo-1512411984249-1667be926715?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1580210352554-1875153288b8?auto=format&fit=crop&w=800&q=80'],
    maxGuests: 15,
    rating: 4.6,
    reviewsCount: 89,
    isActive: true,
    included: ['Transport', 'Guide', 'Déjeuner']
  }
];

export const BOOKINGS: Booking[] = [
  {
    id: 'b1',
    experienceId: 'e1',
    clientId: 'u1',
    date: getFixedDateString(5), // 5th of current month
    time: '09:00',
    guests: 2,
    totalPrice: 900,
    status: BookingStatus.COMPLETED,
    createdAt: '2023-11-01'
  },
  {
    id: 'b2',
    experienceId: 'e2',
    clientId: 'u1',
    date: getFixedDateString(12), // 12th of current month
    time: '18:30',
    guests: 2,
    totalPrice: 1600,
    status: BookingStatus.CONFIRMED,
    createdAt: '2023-12-05'
  },
  {
    id: 'b3',
    experienceId: 'e1',
    clientId: 'u1',
    date: getDateString(1), // Tomorrow
    time: '10:00',
    guests: 4,
    totalPrice: 1800,
    status: BookingStatus.PENDING,
    createdAt: '2023-12-28'
  },
  {
    id: 'b4',
    experienceId: 'e3',
    clientId: 'u1',
    date: getDateString(7), // Next week
    time: '07:00',
    guests: 2,
    totalPrice: 3000,
    status: BookingStatus.PENDING,
    createdAt: '2024-01-20'
  },
  {
    id: 'b5',
    experienceId: 'e4',
    clientId: 'u1',
    date: getFixedDateString(20), // 20th of current month
    time: '14:00',
    guests: 1,
    totalPrice: 350,
    status: BookingStatus.CONFIRMED,
    createdAt: '2024-01-22'
  }
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    clientId: 'u1',
    partnerId: 'p1',
    lastMessage: 'Est-ce que le déjeuner est végétarien ?',
    lastMessageDate: '2023-12-28T14:30:00'
  },
  {
    id: 'c2',
    clientId: 'u2', // Partner asking for support
    partnerId: SUPPORT_PARTNER_ID, // Support
    lastMessage: 'Bonjour, comment modifier mes disponibilités ?',
    lastMessageDate: '2024-01-15T10:00:00'
  }
];

export const MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'u1',
    receiverId: 'u2', // Partner user id
    content: 'Bonjour, pour la randonnée Ourika, est-ce que le déjeuner est végétarien ?',
    timestamp: '2023-12-28T14:30:00',
    read: false
  },
  {
    id: 'm2',
    senderId: 'u2',
    receiverId: 'u3', // Support/Admin
    content: 'Bonjour, comment modifier mes disponibilités ?',
    timestamp: '2024-01-15T10:00:00',
    read: true
  }
];

// --- Service Functions ---

export const getExperienceById = (id: string) => EXPERIENCES.find(e => e.id === id);
export const getPartnerById = (id: string) => PARTNERS.find(p => p.id === id);
export const getPartnerByUserId = (userId: string) => PARTNERS.find(p => p.userId === userId);
export const getUserById = (id: string) => USERS.find(u => u.id === id);

export const getClientBookings = (clientId: string) => {
  return BOOKINGS.filter(b => b.clientId === clientId).map(b => {
    const experience = getExperienceById(b.experienceId);
    return { ...b, experience };
  });
};

export const getPartnerBookings = (partnerId: string) => {
  // Get all experiences for this partner
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
    
    return { 
      ...b, 
      client, 
      experience,
      experienceName: experience?.title,
      partnerName: partner?.companyName
    };
  });
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

export const addExperience = (experience: Experience) => {
  EXPERIENCES.push(experience);
  return experience;
};

export const sendMessage = (senderId: string, receiverId: string, content: string): Conversation | null => {
  const newMessage: Message = {
    id: `m${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    senderId,
    receiverId,
    content,
    timestamp: new Date().toISOString(),
    read: false
  };
  MESSAGES.push(newMessage);

  // Update conversation logic to prioritize Receiver as Partner (Client contacting Partner)
  // Check if receiver is a partner
  let partner = PARTNERS.find(p => p.userId === receiverId);
  let clientId = senderId;
  let partnerId = partner?.id;

  if (!partner) {
      // Receiver is not partner. Maybe Sender is partner (Partner contacting Client)
      partner = PARTNERS.find(p => p.userId === senderId);
      clientId = receiverId;
      partnerId = partner?.id;
  }
  
  // Handling Support scenario (admin is p0) or simple Partner-Client
  if (partnerId) {
      let conversation = CONVERSATIONS.find(c => c.clientId === clientId && c.partnerId === partnerId);
      if (conversation) {
          conversation.lastMessage = content;
          conversation.lastMessageDate = newMessage.timestamp;
          return conversation;
      } else {
          // Create new conversation
           const newConv: Conversation = {
              id: `c${Date.now()}`,
              clientId,
              partnerId,
              lastMessage: content,
              lastMessageDate: newMessage.timestamp
          };
          CONVERSATIONS.push(newConv);
          return newConv;
      }
  }
  return null;
};

// Initiate conversation where PARTNER sends the first message automatically
export const initiateConversationWithWelcomeMessage = (clientId: string, partnerId: string, experienceTitle: string): string => {
    const partner = getPartnerById(partnerId);
    if (!partner) return '';

    // Check if conversation already exists
    let conversation = CONVERSATIONS.find(c => c.clientId === clientId && c.partnerId === partnerId);
    
    // Auto message content
    const welcomeMessage = `Bonjour, merci pour votre intérêt concernant l'expérience "${experienceTitle}". Je suis à votre disposition si vous avez des questions !`;

    if (!conversation) {
        // Create new conversation
        conversation = {
            id: `c${Date.now()}`,
            clientId,
            partnerId,
            lastMessage: welcomeMessage,
            lastMessageDate: new Date().toISOString()
        };
        CONVERSATIONS.push(conversation);
    }

    // Only add message if it's a new conversation or last message was not this welcome message (to avoid duplicates on multi-clicks)
    const existingWelcome = MESSAGES.find(m => 
        m.senderId === partner.userId && 
        m.receiverId === clientId && 
        m.content.includes(experienceTitle)
    );

    if (!existingWelcome) {
        MESSAGES.push({
            id: `m_auto_${Date.now()}`,
            senderId: partner.userId, // Message comes FROM Partner
            receiverId: clientId,     // TO Client
            content: welcomeMessage,
            timestamp: new Date().toISOString(),
            read: false
        });
        
        // Update conversation last message
        conversation.lastMessage = welcomeMessage;
        conversation.lastMessageDate = new Date().toISOString();
    }

    return conversation.id;
};

export const initializeSupportChat = (currentUser: User) => {
  const supportPartnerId = SUPPORT_PARTNER_ID; // p0
  const supportUserId = 'u3'; // Admin/Support User

  // Check if conversation exists
  const existing = CONVERSATIONS.find(c => 
    c.partnerId === supportPartnerId && c.clientId === currentUser.id
  );

  if (!existing) {
    let welcomeText = '';
    
    if (currentUser.role === UserRole.PARTNER) {
       // Get partner details to use company name
       const p = PARTNERS.find(p => p.userId === currentUser.id);
       const name = p ? p.companyName : currentUser.name;
       welcomeText = `Bonjour ${name}, bienvenue sur votre espace partenaire ! Comment pouvons-nous vous aider à gérer vos expériences aujourd'hui ?`;
    } else {
       welcomeText = `Bonjour ${currentUser.name}, bienvenue sur Tourisma ! Une question sur une réservation ou une expérience ? Notre équipe est là pour vous.`;
    }

    const timestamp = new Date().toISOString();
    
    // Create real conversation
    CONVERSATIONS.unshift({
        id: `c_support_${currentUser.id}`,
        partnerId: supportPartnerId,
        clientId: currentUser.id,
        lastMessage: welcomeText,
        lastMessageDate: timestamp
    });

    // Create welcome message
    MESSAGES.push({
        id: `m_init_${currentUser.id}`,
        senderId: supportUserId,
        receiverId: currentUser.id,
        content: welcomeText,
        timestamp: timestamp,
        read: false
    });
  }
};
