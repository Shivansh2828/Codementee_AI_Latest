import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { toast } from 'sonner';
import { X, Calendar, Clock, Video, Briefcase, TrendingUp, Building2, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';

const MentorSlotForm = ({ slot, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const isEditing = !!slot;

  const [formData, setFormData] = useState({
    date: slot?.date || '',
    start_time: slot?.start_time || '',
    end_time: slot?.end_time || '',
    meeting_link: slot?.meeting_link || '',
    interview_types: slot?.interview_types || [],
    experience_levels: slot?.experience_levels || [],
    company_specializations: slot?.company_specializations || [],
    preparation_notes: slot?.preparation_notes || ''
  });

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const interviewTypes = [
    { value: 'coding', label: 'Coding' },
    { value: 'system_design', label: 'System Design' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'hr_round', label: 'HR Round' }
  ];

  const experienceLevels = [
    { value: 'junior', label: 'Junior (0-2 years)' },
    { value: 'mid', label: 'Mid (2-5 years)' },
    { value: 'senior', label: 'Senior (5+ years)' },
    { value: 'staff_plus', label: 'Staff+ (8+ years)' }
  ];

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    if (!formData.meeting_link) newErrors.meeting_link = 'Meeting link is required';

    // Date validation - not in the past
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    // Time range validation - minimum 30 minutes
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      const diffMinutes = (end - start) / (1000 * 60);
      
      if (diffMinutes < 30) {
        newErrors.time_range = 'Time range must be at least 30 minutes';
      }
      if (diffMinutes < 0) {
        newErrors.time_range = 'End time must be after start time';
      }
    }

    // Meeting link validation - basic URL format
    if (formData.meeting_link) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(formData.meeting_link)) {
        newErrors.meeting_link = 'Please enter a valid URL (starting with http:// or https://)';
      }
    }

    // Multi-select validations
    if (formData.interview_types.length === 0) {
      newErrors.interview_types = 'Select at least one interview type';
    }
    if (formData.experience_levels.length === 0) {
      newErrors.experience_levels = 'Select at least one experience level';
    }
    if (formData.company_specializations.length === 0) {
      newErrors.company_specializations = 'Select at least one company';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/mentor/slots/${slot.id}`, formData);
        toast.success('Slot updated successfully');
      } else {
        await api.post('/mentor/slots', formData);
        toast.success('Slot created successfully');
      }
      onSuccess();
    } catch (error) {
      const errorMsg = error.response?.data?.detail?.message || 
                       error.response?.data?.detail || 
                       `Failed to ${isEditing ? 'update' : 'create'} slot`;
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => {
      const currentValues = prev[field];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const isBooked = slot?.status === 'booked';
  const canEditAllFields = !isBooked;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className={`${theme.bg.cardAlt} ${theme.border.cardAlt} border w-full max-w-2xl my-8`}>
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className={theme.text.primary}>
              {isEditing ? 'Edit Slot' : 'Create New Slot'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          {isBooked && (
            <p className="text-sm text-yellow-400 mt-2">
              This slot is booked. You can only edit preparation notes.
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date" className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  disabled={!canEditAllFields}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
              </div>

              <div>
                <Label htmlFor="start_time" className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Start Time *
                </Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  disabled={!canEditAllFields}
                  className={errors.start_time ? 'border-red-500' : ''}
                />
                {errors.start_time && <p className="text-xs text-red-400 mt-1">{errors.start_time}</p>}
              </div>

              <div>
                <Label htmlFor="end_time" className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  End Time *
                </Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  disabled={!canEditAllFields}
                  className={errors.end_time ? 'border-red-500' : ''}
                />
                {errors.end_time && <p className="text-xs text-red-400 mt-1">{errors.end_time}</p>}
              </div>
            </div>

            {errors.time_range && (
              <p className="text-xs text-red-400 -mt-2">{errors.time_range}</p>
            )}

            {/* Meeting Link */}
            <div>
              <Label htmlFor="meeting_link" className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4 text-cyan-400" />
                Meeting Link *
              </Label>
              <Input
                id="meeting_link"
                type="url"
                placeholder="https://meet.google.com/abc-defg-hij"
                value={formData.meeting_link}
                onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                disabled={!canEditAllFields}
                className={errors.meeting_link ? 'border-red-500' : ''}
              />
              {errors.meeting_link && <p className="text-xs text-red-400 mt-1">{errors.meeting_link}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Provide your personal Google Meet, Zoom, or Teams link
              </p>
            </div>

            {/* Interview Types */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                Interview Types *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {interviewTypes.map(type => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={formData.interview_types.includes(type.value)}
                      onCheckedChange={() => handleCheckboxChange('interview_types', type.value)}
                      disabled={!canEditAllFields}
                    />
                    <Label
                      htmlFor={`type-${type.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.interview_types && <p className="text-xs text-red-400 mt-1">{errors.interview_types}</p>}
            </div>

            {/* Experience Levels */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Experience Levels *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {experienceLevels.map(level => (
                  <div key={level.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`level-${level.value}`}
                      checked={formData.experience_levels.includes(level.value)}
                      onCheckedChange={() => handleCheckboxChange('experience_levels', level.value)}
                      disabled={!canEditAllFields}
                    />
                    <Label
                      htmlFor={`level-${level.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {level.label}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.experience_levels && <p className="text-xs text-red-400 mt-1">{errors.experience_levels}</p>}
            </div>

            {/* Company Specializations */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-cyan-400" />
                Company Specializations *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-700 rounded">
                {companies.map(company => (
                  <div key={company.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`company-${company.id}`}
                      checked={formData.company_specializations.includes(company.id)}
                      onCheckedChange={() => handleCheckboxChange('company_specializations', company.id)}
                      disabled={!canEditAllFields}
                    />
                    <Label
                      htmlFor={`company-${company.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {company.name}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.company_specializations && <p className="text-xs text-red-400 mt-1">{errors.company_specializations}</p>}
            </div>

            {/* Preparation Notes */}
            <div>
              <Label htmlFor="preparation_notes" className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Preparation Notes (Optional)
              </Label>
              <Textarea
                id="preparation_notes"
                placeholder="Any preparation instructions or materials for mentees..."
                value={formData.preparation_notes}
                onChange={(e) => setFormData({ ...formData, preparation_notes: e.target.value })}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                These notes will be shared with mentees when they book this slot
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600"
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Slot' : 'Create Slot')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorSlotForm;
