import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { X, Filter } from "lucide-react";
import api from "../../utils/api";
import { toast } from "sonner";

const SlotFilters = ({ filters, onFiltersChange }) => {
  const { theme } = useTheme();
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      toast.error('Failed to load companies');
      console.error('Fetch companies error:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value || null
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      interview_type: null,
      experience_level: null,
      date_from: null,
      date_to: null,
      company_id: null
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

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

  return (
    <Card className={`${theme.glass} ${theme.border.primary} border`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#06b6d4]" />
            <h3 className={`${theme.text.primary} font-semibold text-lg`}>Filter Slots</h3>
          </div>
          {hasActiveFilters && (
            <Button
              onClick={clearAllFilters}
              variant="ghost"
              size="sm"
              className={`${theme.text.secondary} hover:${theme.text.primary} flex items-center gap-2`}
            >
              <X className="w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Interview Type Filter */}
          <div className="space-y-2">
            <Label className={theme.text.secondary}>Interview Type</Label>
            <Select
              value={filters.interview_type || ''}
              onValueChange={(value) => handleFilterChange('interview_type', value)}
            >
              <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent className={`${theme.bg.card} ${theme.border.primary}`}>
                <SelectItem value="" className={theme.text.secondary}>All types</SelectItem>
                {interviewTypes.map((type) => (
                  <SelectItem 
                    key={type.value} 
                    value={type.value}
                    className={theme.text.secondary}
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Experience Level Filter */}
          <div className="space-y-2">
            <Label className={theme.text.secondary}>Experience Level</Label>
            <Select
              value={filters.experience_level || ''}
              onValueChange={(value) => handleFilterChange('experience_level', value)}
            >
              <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent className={`${theme.bg.card} ${theme.border.primary}`}>
                <SelectItem value="" className={theme.text.secondary}>All levels</SelectItem>
                {experienceLevels.map((level) => (
                  <SelectItem 
                    key={level.value} 
                    value={level.value}
                    className={theme.text.secondary}
                  >
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Company Filter */}
          <div className="space-y-2">
            <Label className={theme.text.secondary}>Company</Label>
            <Select
              value={filters.company_id || ''}
              onValueChange={(value) => handleFilterChange('company_id', value)}
              disabled={loadingCompanies}
            >
              <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}>
                <SelectValue placeholder={loadingCompanies ? "Loading..." : "All companies"} />
              </SelectTrigger>
              <SelectContent className={`${theme.bg.card} ${theme.border.primary}`}>
                <SelectItem value="" className={theme.text.secondary}>All companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem 
                    key={company.id} 
                    value={company.id}
                    className={theme.text.secondary}
                  >
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date From Filter */}
          <div className="space-y-2">
            <Label className={theme.text.secondary}>From Date</Label>
            <Input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}
            />
          </div>

          {/* Date To Filter */}
          <div className="space-y-2">
            <Label className={theme.text.secondary}>To Date</Label>
            <Input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              min={filters.date_from || new Date().toISOString().split('T')[0]}
              className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}
            />
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex flex-wrap gap-2">
              {filters.interview_type && (
                <div className="flex items-center gap-2 bg-blue-400/20 text-blue-400 border border-blue-400/30 px-3 py-1 rounded-full text-sm">
                  <span>Type: {interviewTypes.find(t => t.value === filters.interview_type)?.label}</span>
                  <button
                    onClick={() => handleFilterChange('interview_type', null)}
                    className="hover:bg-blue-400/30 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.experience_level && (
                <div className="flex items-center gap-2 bg-teal-400/20 text-teal-400 border border-teal-400/30 px-3 py-1 rounded-full text-sm">
                  <span>Level: {experienceLevels.find(l => l.value === filters.experience_level)?.label}</span>
                  <button
                    onClick={() => handleFilterChange('experience_level', null)}
                    className="hover:bg-teal-400/30 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.company_id && (
                <div className="flex items-center gap-2 bg-purple-400/20 text-purple-400 border border-purple-400/30 px-3 py-1 rounded-full text-sm">
                  <span>Company: {companies.find(c => c.id === filters.company_id)?.name}</span>
                  <button
                    onClick={() => handleFilterChange('company_id', null)}
                    className="hover:bg-purple-400/30 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.date_from && (
                <div className="flex items-center gap-2 bg-green-400/20 text-green-400 border border-green-400/30 px-3 py-1 rounded-full text-sm">
                  <span>From: {new Date(filters.date_from).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleFilterChange('date_from', null)}
                    className="hover:bg-green-400/30 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.date_to && (
                <div className="flex items-center gap-2 bg-orange-400/20 text-orange-400 border border-orange-400/30 px-3 py-1 rounded-full text-sm">
                  <span>To: {new Date(filters.date_to).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleFilterChange('date_to', null)}
                    className="hover:bg-orange-400/30 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SlotFilters;
