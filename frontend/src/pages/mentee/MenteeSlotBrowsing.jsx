import React, { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Calendar, List } from "lucide-react";
import SlotBrowser from '../../components/mentee/SlotBrowser';
import MenteeBookingsList from '../../components/mentee/MenteeBookingsList';

const MenteeSlotBrowsing = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('browse');

  return (
    <DashboardLayout title="Mock Interviews">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>
            Mock Interview Slots
          </h1>
          <p className={theme.text.secondary}>
            Browse available slots and manage your bookings
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full max-w-md mx-auto grid-cols-2 ${theme.bg.secondary}`}>
            <TabsTrigger 
              value="browse" 
              className={`flex items-center gap-2 ${
                activeTab === 'browse' 
                  ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white' 
                  : theme.text.secondary
              }`}
            >
              <Calendar className="w-4 h-4" />
              Browse Slots
            </TabsTrigger>
            <TabsTrigger 
              value="bookings" 
              className={`flex items-center gap-2 ${
                activeTab === 'bookings' 
                  ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white' 
                  : theme.text.secondary
              }`}
            >
              <List className="w-4 h-4" />
              My Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <SlotBrowser />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <MenteeBookingsList />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MenteeSlotBrowsing;
