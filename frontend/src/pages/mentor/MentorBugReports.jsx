import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Bug, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import api from "../../utils/api";

const MentorBugReports = () => {
  const { theme } = useTheme();
  const [bugReports, setBugReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    fetchBugReports();
  }, []);

  const fetchBugReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bug-reports/my');
      const bugs = response.data || [];
      setBugReports(bugs);
      
      setStats({
        total: bugs.length,
        open: bugs.filter(b => b.status === 'open').length,
        inProgress: bugs.filter(b => b.status === 'in_progress').length,
        resolved: bugs.filter(b => b.status === 'resolved').length
      });
    } catch (error) {
      console.error('Failed to fetch bug reports:', error);
      toast.error('Failed to load bug reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { className: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30', label: 'Open' },
      in_progress: { className: 'bg-blue-400/20 text-blue-400 border-blue-400/30', label: 'In Progress' },
      resolved: { className: 'bg-green-400/20 text-green-400 border-green-400/30', label: 'Resolved' }
    };
    
    const config = statusConfig[status] || statusConfig.open;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-400',
      high: 'text-orange-400',
      medium: 'text-yellow-400',
      low: 'text-green-400'
    };
    return colors[severity] || colors.medium;
  };

  if (loading) {
    return (
      <DashboardLayout title="My Bug Reports">
        <div className={`text-center py-12 ${theme.text.secondary}`}>
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading your bug reports...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Bug Reports">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>
              My Bug Reports
            </h1>
            <p className={theme.text.secondary}>
              Track the status of issues you've reported
            </p>
          </div>
          <Button
            onClick={fetchBugReports}
            variant="outline"
            className={theme.button.secondary}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`${theme.glass} border ${theme.border.primary}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${theme.text.muted} text-sm mb-1`}>Total Reports</p>
                  <p className={`${theme.text.primary} text-3xl font-bold`}>{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center">
                  <Bug className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.glass} border ${theme.border.primary}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${theme.text.muted} text-sm mb-1`}>Open</p>
                  <p className={`${theme.text.primary} text-3xl font-bold`}>{stats.open}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.glass} border ${theme.border.primary}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${theme.text.muted} text-sm mb-1`}>In Progress</p>
                  <p className={`${theme.text.primary} text-3xl font-bold`}>{stats.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.glass} border ${theme.border.primary}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${theme.text.muted} text-sm mb-1`}>Resolved</p>
                  <p className={`${theme.text.primary} text-3xl font-bold`}>{stats.resolved}</p>
                </div>
                <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {bugReports.length === 0 ? (
          <Card className={`${theme.glass} border ${theme.border.primary}`}>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bug className={`w-16 h-16 ${theme.text.muted} mb-4`} />
              <h3 className={`${theme.text.primary} text-xl font-semibold mb-2`}>
                No bug reports yet
              </h3>
              <p className={`${theme.text.secondary} text-center max-w-md`}>
                Found an issue? Use the "Report Bug" button in the header to submit a bug report.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bugReports.map((bug) => (
              <Card key={bug.id} className={`${theme.glass} border ${theme.border.primary} hover:border-[#06b6d4]/30 transition-colors`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`${theme.text.primary} text-xl font-semibold`}>
                          {bug.title}
                        </h3>
                        {getStatusBadge(bug.status)}
                        {bug.status === 'resolved' && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <p className={`${theme.text.secondary} mb-3`}>
                        {bug.description}
                      </p>
                    </div>
                  </div>

                  <div className={`${theme.bg.secondary} rounded-lg p-4`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className={`${theme.text.muted} text-xs mb-1`}>Severity</p>
                        <p className={`${getSeverityColor(bug.severity)} font-semibold capitalize`}>
                          {bug.severity}
                        </p>
                      </div>
                      <div>
                        <p className={`${theme.text.muted} text-xs mb-1`}>Priority</p>
                        <p className={`${theme.text.primary} font-semibold capitalize`}>
                          {bug.priority || 'Medium'}
                        </p>
                      </div>
                      <div>
                        <p className={`${theme.text.muted} text-xs mb-1`}>Submitted</p>
                        <p className={`${theme.text.primary} font-semibold`}>
                          {new Date(bug.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {bug.page_url && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className={`${theme.text.muted} text-xs mb-1`}>Page</p>
                        <p className={`${theme.text.secondary} text-sm font-mono`}>
                          {bug.page_url}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MentorBugReports;
