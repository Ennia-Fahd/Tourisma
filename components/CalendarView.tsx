import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Clock, CheckCircle, XCircle, X, MapPin, Mail, Phone, DollarSign, Calendar as CalendarIconLucide, ExternalLink, Info } from 'lucide-react';
import { Booking, BookingStatus, UserRole } from '../types';

interface CalendarViewProps {
  bookings: any[]; // Using any because our bookings are enriched with extra fields in the hooks
  role: UserRole;
  onViewProfile?: (data: any, type: 'CLIENT' | 'PARTNER') => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ bookings, role, onViewProfile }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    // 0 = Sunday, 1 = Monday, etc. Adjusting so Monday is 0 for our grid if we want Mon-Sun
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday(0) to 6, Mon(1) to 0
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  const handleOpenMap = (location: string) => {
    // Open Google Maps search in a new tab
    const query = encodeURIComponent(`${location}, Maroc`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  // Helper for status colors
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED: return 'bg-green-100 text-green-900 border-green-200 hover:bg-green-200';
      case BookingStatus.PENDING: return 'bg-yellow-50 text-yellow-900 border-yellow-200 hover:bg-yellow-100';
      case BookingStatus.CANCELLED: return 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100 opacity-60';
      case BookingStatus.COMPLETED: return 'bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200';
      default: return 'bg-gray-50';
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED: return <CheckCircle size={12} className="text-green-700" />;
      case BookingStatus.PENDING: return <Clock size={12} className="text-yellow-600" />;
      case BookingStatus.CANCELLED: return <XCircle size={12} className="text-red-600" />;
      default: return null;
    }
  };

  const renderCells = () => {
    const cells = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Empty cells for days before start of month
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-32 bg-gray-50/30 border-r border-b border-gray-100"></div>);
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDateString(year, month, d);
      // Sort bookings by time
      const dayBookings = bookings
        .filter(b => b.date === dateStr)
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

      cells.push(
        <div key={d} className={`h-32 border-r border-b border-gray-200 p-1 relative group hover:bg-gray-50 transition-colors overflow-y-auto no-scrollbar`}>
          <div className={`text-xs font-semibold mb-1 ml-1 ${
              isToday
              ? 'bg-brand-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm' 
              : 'text-gray-700'
            }`}>
            {d}
          </div>
          
          <div className="space-y-1 mt-1">
            {dayBookings.map((booking) => (
              <div 
                key={booking.id} 
                onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                className={`text-[10px] p-1.5 rounded-md border ${getStatusColor(booking.status)} cursor-pointer shadow-sm transition-all hover:scale-[1.02] flex flex-col gap-1`}
                title="Cliquez pour voir les détails"
              >
                {/* Time Badge - Highly visible */}
                <div className="flex justify-between items-center bg-white/70 rounded px-1.5 py-0.5 -mx-0.5">
                   <div className="font-mono font-bold text-gray-900 flex items-center text-[10px]">
                     <Clock size={8} className="mr-1 opacity-70"/>
                     {booking.time || 'N/A'}
                   </div>
                   {getStatusIcon(booking.status)}
                </div>
                
                <div className="font-bold truncate leading-tight mt-0.5">
                  {role === UserRole.CLIENT 
                    ? booking.experience?.title || booking.experienceName
                    : role === UserRole.ADMIN 
                      ? `${booking.partnerName || 'Partenaire'}: ${booking.experienceName}`
                      : booking.experienceName
                  }
                </div>
                
                <div className="flex items-center gap-1 opacity-80">
                   <User size={8} /> 
                   <span className="truncate">
                      {role === UserRole.PARTNER || role === UserRole.ADMIN ? booking.client?.name?.split(' ')[0] : `${booking.guests} pers`}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
           <CalendarIcon /> {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-200 rounded-full transition"><ChevronLeft size={20} /></button>
          <button onClick={() => changeMonth(0)} className="px-3 py-1 text-sm font-medium hover:bg-gray-200 rounded-full transition border border-gray-300">Aujourd'hui</button>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-200 rounded-full transition"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 bg-white">
        {renderCells()}
      </div>
      
      {/* Legend */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 flex gap-4 text-xs text-gray-600 flex-wrap">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div> En attente</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div> Confirmé</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded opacity-60"></div> Annulé</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div> Terminé</div>
      </div>

      {/* Details Modal */}
      {selectedBooking && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative h-32 bg-gray-200">
               {selectedBooking.experience?.images?.[0] ? (
                 <img src={selectedBooking.experience.images[0]} className="w-full h-full object-cover" alt="" />
               ) : (
                 <div className="w-full h-full bg-gradient-to-r from-brand-500 to-morocco-ochre flex items-center justify-center text-white">
                   <CalendarIconLucide size={48} className="opacity-50" />
                 </div>
               )}
               <button 
                 onClick={() => setSelectedBooking(null)}
                 className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1 rounded-full shadow-sm transition"
               >
                 <X size={20} />
               </button>
               <div className="absolute bottom-2 left-2">
                 <span className={`px-2 py-1 rounded-full text-xs font-bold border shadow-sm
                   ${selectedBooking.status === BookingStatus.PENDING ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                   ${selectedBooking.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-800 border-green-200' : ''}
                   ${selectedBooking.status === BookingStatus.CANCELLED ? 'bg-red-100 text-red-800 border-red-200' : ''}
                   ${selectedBooking.status === BookingStatus.COMPLETED ? 'bg-gray-100 text-gray-800 border-gray-200' : ''}
                 `}>
                   {selectedBooking.status === BookingStatus.PENDING && 'En attente'}
                   {selectedBooking.status === BookingStatus.CONFIRMED && 'Confirmé'}
                   {selectedBooking.status === BookingStatus.CANCELLED && 'Annulé'}
                   {selectedBooking.status === BookingStatus.COMPLETED && 'Terminé'}
                 </span>
               </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-lg text-gray-900 leading-tight mb-4">
                {selectedBooking.experienceName || selectedBooking.experience?.title}
              </h3>

              <div className="space-y-4">
                {/* Date & Time */}
                <div className="flex gap-4">
                  <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1 font-bold uppercase">
                      <CalendarIconLucide size={12} /> Date
                    </div>
                    <div className="font-semibold text-sm">{selectedBooking.date}</div>
                  </div>
                  <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1 font-bold uppercase">
                      <Clock size={12} /> Heure
                    </div>
                    <div className="font-semibold text-sm">{selectedBooking.time || 'N/A'}</div>
                  </div>
                </div>

                {/* Price & Guests */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                     <div className="bg-brand-50 p-2 rounded-full text-brand-600">
                        <User size={16} />
                     </div>
                     <div>
                       <div className="text-xs text-gray-500">Voyageurs</div>
                       <div className="font-bold text-sm">{selectedBooking.guests} Personnes</div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-xs text-gray-500">Prix Total</div>
                     <div className="font-bold text-brand-600">{selectedBooking.totalPrice} MAD</div>
                  </div>
                </div>

                {/* Role Specific Info with Clickable Profile */}
                {(role === UserRole.PARTNER || role === UserRole.ADMIN) && selectedBooking.client && (
                   <div className="mt-4 pt-4 border-t">
                     <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Informations Client</h4>
                     <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if(onViewProfile) onViewProfile(selectedBooking.client, 'CLIENT');
                        }}
                        className="w-full flex items-center gap-3 mb-2 hover:bg-gray-50 p-2 -ml-2 rounded-lg transition-colors group text-left"
                     >
                       {selectedBooking.client.avatarUrl ? (
                         <img src={selectedBooking.client.avatarUrl} className="w-10 h-10 rounded-full border" alt="" />
                       ) : (
                         <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><User size={20}/></div>
                       )}
                       <div className="flex-1">
                         <div className="font-bold text-sm text-gray-900 group-hover:text-brand-600 flex items-center gap-2">
                             {selectedBooking.client.name}
                             <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                         </div>
                         <div className="text-xs text-gray-500">Voir le profil complet</div>
                       </div>
                     </button>
                     
                     <div className="space-y-2 pl-2">
                       <a href={`mailto:${selectedBooking.client.email}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-brand-600">
                         <Mail size={12} /> {selectedBooking.client.email}
                       </a>
                     </div>
                   </div>
                )}
                
                {role === UserRole.CLIENT && selectedBooking.experience && (
                   <div className="mt-4 pt-4 border-t">
                     <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Lieu</h4>
                     <div className="flex items-start gap-2 text-sm text-gray-700">
                        <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{selectedBooking.experience.location || 'Marrakech, Maroc'}</span>
                     </div>
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         handleOpenMap(selectedBooking.experience.location || 'Maroc');
                       }}
                       className="mt-3 w-full text-xs bg-brand-50 text-brand-700 py-2 px-3 rounded-lg font-bold hover:bg-brand-100 text-left flex items-center justify-between transition-colors"
                     >
                       <span>Voir sur la carte</span>
                       <ExternalLink size={14} />
                     </button>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

export default CalendarView;