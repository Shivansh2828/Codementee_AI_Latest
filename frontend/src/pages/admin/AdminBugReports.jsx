import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { 
  Bug, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Calendar,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Filter
} from "lucide-react";
import api from "../../utils/api";

const AdminBugReports = () => {
  const { theme } = useTheme();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBug, setSelectedBug] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchBugs();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchBugs, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBugs = async () => {
    try {
      const response = await api.get('/admin/bug-reports');
      setBugs(response.data);
    } catch (error) {
      console.error('Failed to fetch bug reports:', error);
      toast.error('Failed to load bug reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bugId, newStatus) => {
    try {
      await api.put(`/admin/bug-reports/${bugId}/status`, { status: newStatus });
      toast.success('Bug status updated successfully');
      fetchBugs();
      if (selectedBug?.id === bugId) {
        setSelectedBug({ ...selectedBug, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update bug status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle, label: 'Open' },
      in_progress: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'In Progress' },
      resolved: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Resolved' }
    };

    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border px-3 py-1`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-blue-500/20 text-blue-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-orange-500/20 text-orange-400',
      critical: 'bg-red-500/20 text-red-400'
    };
    return (
      <Badge className={colors[priority] || colors.medium}>
        {priority?.toUpperCase() || 'MEDIUM'}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredBugs = bugs.filter(bug => {
    if (filterStatus === 'all') return true;
    return bug.status === filterStatus;
  });

  const stats = {
    total: bugs.length,
    open: bugs.filter(b => b.status === 'open').length,
    in_progress: bugs.filter(b => b.status === 'in_progress').length,
    resolved: bugs.filter(b => b.status === 'resolved').length
  };

  if (loading) {
    return (
      <DashboardLayout title="Bug Reports">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06b6d4] mx-auto mb-4"></div>
            <p className={theme.text.secondary}>Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Bug Reports">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${theme.text.muted} text-sm`}>Total Reports</p>
                  <p className={`${theme.text.primary} text-3xl font-bold mt-1`}>{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Bug className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${theme.text.muted} text-sm`}>Open</p>
                  <p className={`${theme.text.primary} text-3xl font-bold mt-1`}>{stats.open}</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${theme.text.muted} text-sm`}>In Progress</p>
                  <p className={`${theme.text.primary} text-3xl font-bold mt-1`}>{stats.in_progress}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${theme.text.muted} text-sm`}>Resolved</p>
                  <p className={`${theme.text.primary} text-3xl font-bold mt-1`}>{stats.resolved}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className={`w-4 h-4 ${theme.text.muted}`} />
              <span className={`${theme.text.secondary} text-sm font-medium`}>Filter:</span>
              {['all', 'open', 'in_progress', 'resolved'].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bug Reports List */}
        <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
          <CardHeader>
            <CardTitle className={theme.text.primary}>Bug Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBugs.length === 0 ? (
              <div className="text-center py-12">
                <Bug className={`w-16 h-16 ${theme.text.muted} mx-auto mb-4`} />
                <p className={`${theme.text.secondary} mb-2`}>No bug reports found</p>
                <p className={theme.text.muted}>
                  {filterStatus !== 'all' ? `No ${filterStatus.replace('_', ' ')} reports` : 'All clear!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBugs.map((bug) => (
                  <div
                    key={bug.id}
                    className={`${theme.bg.secondary} rounded-lg p-6 ${theme.border.primary} border hover:border-[#06b6d4] transition-colors cursor-pointer`}
                    onClick={() => {
                      setSelectedBug(bug);
                      setShowDetailModal(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`${theme.text.primary} text-lg font-semibold`}>
                            {bug.title}
                          </h3>
                          {getStatusBadge(bug.status)}
                          {getPriorityBadge(bug.priority)}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={theme.text.muted}>
                            <User className="w-4 h-4 inline mr-1" />
                            {bug.reporter_name} ({bug.reporter_role})
                          </span>
                          <span className={theme.text.muted}>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {formatDate(bug.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {bug.status !== 'in_progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(bug.id, 'in_progress');
                            }}
                            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                          >
                            Mark In Progress
                          </Button>
                        )}
                        {bug.status !== 'resolved' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(bug.id, 'resolved');
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className={`${theme.text.secondary} text-sm mb-3 line-clamp-2`}>
                      {bug.description}
                    </p>

                    {bug.page_url && (
                      <div className={`${theme.bg.tertiary} rounded-lg p-2 text-xs ${theme.text.muted}`}>
                        <FileText className="w-3 h-3 inline mr-1" />
                        Page: {bug.page_url}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBug && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`${theme.bg.card} rounded-xl border ${theme.border.primary} p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className={`${theme.text.primary} text-2xl font-bold mb-2`}>{selectedBug.title}</h2>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedBug.status)}
                  {getPriorityBadge(selectedBug.priority)}
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className={`${theme.text.secondary} hover:${theme.text.primary}`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className={`${theme.text.muted} text-sm mb-1`}>Reported By</p>
                <p className={theme.text.primary}>{selectedBug.reporter_name} ({selectedBug.reporter_role})</p>
              </div>

              <div>
                <p className={`${theme.text.muted} text-sm mb-1`}>Date</p>
                <p className={theme.text.primary}>{formatDate(selectedBug.created_at)}</p>
              </div>

              <div>
                <p className={`${theme.text.muted} text-sm mb-1`}>Description</p>
                <p className={`${theme.text.primary} whitespace-pre-line`}>{selectedBug.description}</p>
              </div>

              {selectedBug.page_url && (
                <div>
                  <p className={`${theme.text.muted} text-sm mb-1`}>Page URL</p>
                  <a
                    href={selectedBug.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#06b6d4] hover:underline flex items-center gap-1"
                  >
                    {selectedBug.page_url}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {selectedBug.screenshot_url && (
                <div>
                  <p className={`${theme.text.muted} text-sm mb-2`}>Screenshot</p>
                  <img
                    src={selectedBug.screenshot_url}
                    alt="Bug screenshot"
                    className="w-full rounded-lg border border-gray-700"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                {selectedBug.status !== 'in_progress' && (
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedBug.id, 'in_progress');
                      setShowDetailModal(false);
                    }}
                    variant="outline"
                    className="flex-1 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    Mark In Progress
                  </Button>
                )}
                {selectedBug.status !== 'resolved' && (
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedBug.id, 'resolved');
                      setShowDetailModal(false);
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminBugReports;
