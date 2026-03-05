import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { Calendar, Clock, Briefcase, TrendingUp, Building2, RefreshCw, Search, Filter } from "lucide-react";
import api from "../../utils/api";
import SlotFilters from './SlotFilters';
import BookingModal from './BookingModal';

const SlotBrowser = () => {
  const { theme } = useTheme();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    interview_type: null,
    experience_level: null,
    date_from: null,
    date_to: null,
    company_id: null
  });

  useEffect(() => {
    fetchSlots();
  }, [filters]);

  const fetchSlots = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters.interview_type) params.append('interview_type', filters.interview_type);
      if (filters.experience_level) params.append('experience_level', filters.experience_level);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.company_id) params.append('company_id', filters.company_id);

      const response = await api.get(`/mentee/slots/browse?${params.toString()}`);
      setSlots(response.data);
      
      if (showRefreshing) {
        toast.success('Slots refreshed!');
      }
    } catch (error) {
      toast.error('Failed to fetch available slots');
      console.error('Fetch slots error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBookSlot = (slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedSlot(null);
    fetchSlots(true);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInterviewTypeColor = (type) => {
    const colors = {
      coding: 'bg-blue-400/20 text-blue-400 border-blue-400/30',
      system_design: 'bg-purple-400/20 text-purple-400 border-purple-400/30',
      behavioral: 'bg-green-400/20 text-green-400 border-green-400/30',
      hr_round: 'bg-orange-400/20 text-orange-400 border-orange-400/30'
    };
    return colors[type] || 'bg-gray-400/20 text-gray-400 border-gray-400/30';
  };

  const getExperienceLevelColor = (level) => {
    const colors = {
      junior: 'bg-cyan-400/20 text-cyan-400 border-cyan-400/30',
      mid: 'bg-teal-400/20 text-teal-400 border-teal-400/30',
      senior: 'bg-indigo-400/20 text-indigo-400 border-indigo-400/30',
      staff_plus: 'bg-pink-400/20 text-pink-400 border-pink-400/30'
    };
    return colors[level] || 'bg-gray-400/20 text-gray-400 border-gray-400/30';
  };

  if (loading) {
    return (
      <div className={`text-center py-12 ${theme.text.secondary}`}>
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Loading available slots...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${theme.text.primary}`}>Available Interview Slots</h2>
          <p className={`${theme.text.secondary} text-sm mt-1`}>
            {slots.length} slot{slots.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className={`${theme.button.secondary} flex items-center gap-2`}
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            onClick={() => fetchSlots(true)}
            disabled={refreshing}
            variant="outline"
            className={`${theme.button.secondary} flex items-center gap-2`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <SlotFilters 
          filters={filters} 
          onFiltersChange={setFilters}
        />
      )}

      {/* Slots Grid */}
      {slots.length === 0 ? (
        <div className={`${theme.glass} rounded-2xl p-12 text-center ${theme.border.primary} border`}>
          <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h3 className={`text-xl font-semibold ${theme.text.primary} mb-3`}>No slots available</h3>
          <p className={`${theme.text.secondary} mb-6 max-w-md mx-auto`}>
            {Object.values(filters).some(v => v) 
              ? 'Try adjusting your filters to see more slots.'
              : 'Check back later for new availability.'}
          </p>
          {Object.values(filters).some(v => v) && (
            <Button
              onClick={() => setFilters({
                interview_type: null,
                experience_level: null,
                date_from: null,
                date_to: null,
                company_id: null
              })}
              className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map((slot) => (
            <Card 
              key={slot.id} 
              className={`${theme.glass} ${theme.border.primary} border ${theme.shadow} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`${theme.text.primary} font-semibold`}>
                        {formatDate(slot.date)}
                      </p>
                      <p className={`${theme.text.secondary} text-sm flex items-center gap-1`}>
                        <Clock className="w-3 h-3" />
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interview Types */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {slot.interview_types.map((type) => (
                      <Badge 
                        key={type} 
                        className={`${getInterviewTypeColor(type)} text-xs px-2 py-1`}
                      >
                        <Briefcase className="w-3 h-3 mr-1 inline" />
                        {type.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>

                  {/* Experience Levels */}
                  <div className="flex flex-wrap gap-2">
                    {slot.experience_levels.map((level) => (
                      <Badge 
                        key={level} 
                        className={`${getExperienceLevelColor(level)} text-xs px-2 py-1`}
                      >
                        <TrendingUp className="w-3 h-3 mr-1 inline" />
                        {level.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-3">
                {/* Company Specializations */}
                {slot.company_specializations && slot.company_specializations.length > 0 && (
                  <div className="mb-4">
                    <p className={`${theme.text.muted} text-xs mb-2 flex items-center gap-1`}>
                      <Building2 className="w-3 h-3" />
                      Company Specializations
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {slot.company_specializations.slice(0, 3).map((company, index) => (
                        <span 
                          key={index}
                          className={`${theme.bg.secondary} ${theme.text.secondary} text-xs px-2 py-1 rounded`}
                        >
                          {company.name || company}
                        </span>
                      ))}
                      {slot.company_specializations.length > 3 && (
                        <span className={`${theme.text.muted} text-xs px-2 py-1`}>
                          +{slot.company_specializations.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Preparation Notes Preview */}
                {slot.preparation_notes && (
                  <div className={`${theme.bg.secondary} rounded-lg p-3 mb-4`}>
                    <p className={`${theme.text.muted} text-xs mb-1`}>Preparation Notes</p>
                    <p className={`${theme.text.secondary} text-sm line-clamp-2`}>
                      {slot.preparation_notes}
                    </p>
                  </div>
                )}

                {/* Book Button */}
                <Button
                  onClick={() => handleBookSlot(slot)}
                  className="w-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white hover:from-[#0891b2] hover:to-[#0e7490] transition-all"
                >
                  Book This Slot
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default SlotBrowser;
