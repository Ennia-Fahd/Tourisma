
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, User, Clock, CheckCircle, XCircle, X, MapPin, Mail, Phone, DollarSign, Calendar as CalendarIconLucide, ExternalLink, Info, Filter, Search } from 'lucide-react';
import { Booking, BookingStatus, UserRole } from '../types';

interface CalendarViewProps {
  bookings: any[];
  role: UserRole;
  onViewProfile?: (data: any, type: 'CLIENT' | 'PARTNER') => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ bookings, role, onViewProfile }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  
  // Filters
  const [filterExperience, setFilterExperience] = useState<string>('all');
  
  const years = [2023, 2024, 2025];
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const uniqueExperiences = useMemo(() => {
    const names = new Set(bookings.map(b => b.experienceName || b.experience?.title));
    return Array.from(names).filter(Boolean);
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchExp = filterExperience === 'all' || (b.experienceName === filterExperience || b.experience?.title === filterExperience);
      return matchExp;
    });
  }, [bookings, filterExperience]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const handleDateJump = (month: number, year: number) => {
    setCurrentDate(new Date(year, month, 1));
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED: return 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100';
      case BookingStatus.PENDING: return 'bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-100';
      case BookingStatus.CANCELLED: return 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100 opacity-60';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const renderCells = () => {
    const cells = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-32 bg-gray-50/20 border-r border-b border-gray-100"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDateString(year, month, d);
      const dayBookings = filteredBookings
        .filter(b => b.date === dateStr)
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

      cells.push(
        <div key={d} className="h-32 border-r border-b border-gray-200 p-2 relative group hover:bg-gray-50/50 transition-colors overflow-y-auto no-scrollbar">
          <div className={`text-[10px] font-black mb-2 flex items-center justify-center w-6 h-6 rounded-lg ${isToday ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400'}`}>
            {d}
          </div>
          
          <div className="space-y-1.5">
            {dayBookings.map((booking) => (
              <div 
                key={booking.id} 
                onClick={() => setSelectedBooking(booking)}
                className={`text-[9px] p-2 rounded-xl border font-black uppercase tracking-tighter cursor-pointer transition-all hover:scale-105 shadow-sm ${getStatusColor(booking.status)}`}
              >
                <div className="flex justify-between items-center mb-1">
                   <span className="flex items-center gap-1 font-mono"><Clock size={10}/> {booking.time}</span>
                   {booking.status === BookingStatus.CONFIRMED && <CheckCircle size={10}/>}
                </div>
                <div className="truncate opacity-90">{booking.experienceName || booking.experience?.title}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-fade-in">
      {/* Advanced Filter Bar */}
      <div className="p-6 lg:p-8 border-b bg-gray-50/30 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
           <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
              <select 
                value={currentDate.getMonth()} 
                onChange={(e) => handleDateJump(parseInt(e.target.value), currentDate.getFullYear())}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest px-4 py-2 outline-none cursor-pointer"
              >
                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select 
                value={currentDate.getFullYear()} 
                onChange={(e) => handleDateJump(currentDate.getMonth(), parseInt(e.target.value))}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest px-4 py-2 outline-none cursor-pointer border-l"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
           </div>

           <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-600" size={14} />
              <select 
                value={filterExperience}
                onChange={(e) => setFilterExperience(e.target.value)}
                className="pl-10 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-500 shadow-sm appearance-none cursor-pointer"
              >
                <option value="all">Toutes les expériences</option>
                {uniqueExperiences.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button onClick={() => changeMonth(-1)} className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm"><ChevronLeft size={18}/></button>
           <button onClick={() => setCurrentDate(new Date())} className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">Aujourd'hui</button>
           <button onClick={() => changeMonth(1)} className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm"><ChevronRight size={18}/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b bg-white">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 bg-white overflow-y-auto no-scrollbar">
        {renderCells()}
      </div>

      {selectedBooking && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md animate-fade-in" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="relative h-48 bg-gray-100">
               {selectedBooking.experience?.images?.[0] && <img src={selectedBooking.experience.images[0]} className="w-full h-full object-cover" alt="" />}
               <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 bg-white/90 p-2 rounded-full shadow-lg"><X size={20} /></button>
            </div>
            <div className="p-10">
               <div className="flex justify-between items-start mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(selectedBooking.status)}`}>
                     {selectedBooking.status}
                  </span>
                  <div className="text-right">
                     <div className="text-[10px] text-gray-400 font-black uppercase">Prix Total</div>
                     <div className="text-2xl font-black text-brand-600">{selectedBooking.totalPrice} MAD</div>
                  </div>
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-8 leading-tight tracking-tighter">{selectedBooking.experienceName || selectedBooking.experience?.title}</h3>
               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                     <div className="text-[9px] text-gray-400 font-black uppercase mb-1">Date & Heure</div>
                     <div className="text-xs font-bold">{selectedBooking.date} à {selectedBooking.time}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                     <div className="text-[9px] text-gray-400 font-black uppercase mb-1">Participants</div>
                     <div className="text-xs font-bold">{selectedBooking.guests} Personnes</div>
                  </div>
               </div>
               {selectedBooking.client && (
                 <div className="pt-8 border-t border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center font-black text-brand-600">{selectedBooking.client.name[0]}</div>
                    <div className="flex-1">
                       <div className="text-[9px] text-gray-400 font-black uppercase">Client</div>
                       <div className="text-sm font-black text-gray-900">{selectedBooking.client.name}</div>
                    </div>
                    <button onClick={() => onViewProfile?.(selectedBooking.client, 'CLIENT')} className="p-3 bg-gray-900 text-white rounded-xl hover:scale-105 transition-all"><ExternalLink size={16}/></button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
