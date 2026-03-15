import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { toast } from "sonner";
import { 
  Users, 
  Search, 
  Edit, 
  TrendingUp, 
  Plus,
  RefreshCw,
  UserCheck,
  UserX,
  Award,
  Calendar,
  Eye,
  EyeOff
} from "lucide-react";
import api from "../../utils/api";

const AdminUserManagement = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editDialog, setEditDialog] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [pricingPlans, setPricingPlans] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchPricingPlans();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingPlans = async () => {
    try {
      const response = await api.get('/pricing-plans');
      setPricingPlans(response.data);
    } catch (error) {
      console.error('Failed to load pricing plans');
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user) => {
    setEditDialog(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      plan_id: user.plan_id || "none",
      interview_quota_remaining: user.interview_quota_remaining || 0,
      resume_review_quota: user.resume_review_quota || 0,
      password: '' // Empty by default, only update if filled
    });
    setShowPassword(false);
  };

  const handleUpdateUser = async () => {
    try {
      const updateData = {
        ...editForm,
        plan_id: editForm.plan_id === "none" ? null : editForm.plan_id
      };
      await api.put(`/admin/users/${editDialog.id}`, updateData);
      toast.success('User updated successfully');
      setEditDialog(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleIncreaseQuota = async (userId, quotaType, amount) => {
    try {
      await api.post(`/admin/users/${userId}/increase-quota`, {
        quota_type: quotaType,
        amount: parseInt(amount)
      });
      toast.success(`${quotaType} quota increased by ${amount}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to increase quota');
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-400/20 text-red-400 border-red-400/30',
      mentor: 'bg-blue-400/20 text-blue-400 border-blue-400/30',
      mentee: 'bg-green-400/20 text-green-400 border-green-400/30'
    };
    return colors[role] || colors.mentee;
  };

  const getStatusBadge = (status) => {
    const colors = {
      Active: 'bg-green-400/20 text-green-400 border-green-400/30',
      Free: 'bg-gray-400/20 text-gray-400 border-gray-400/30',
      Paused: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
      Cancelled: 'bg-red-400/20 text-red-400 border-red-400/30'
    };
    return colors[status] || colors.Free;
  };

  if (loading) {
    return (
      <DashboardLayout title="User Management">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-[#06b6d4]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${theme.glass} rounded-xl p-4 ${theme.border.primary} border`}>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className={`${theme.text.muted} text-sm`}>Total Users</p>
                <p className="text-2xl font-bold text-blue-400">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className={`${theme.glass} rounded-xl p-4 ${theme.border.primary} border`}>
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-green-400" />
              <div>
                <p className={`${theme.text.muted} text-sm`}>Active Users</p>
                <p className="text-2xl font-bold text-green-400">
                  {users.filter(u => u.status === 'Active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`${theme.glass} rounded-xl p-4 ${theme.border.primary} border`}>
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-400" />
              <div>
                <p className={`${theme.text.muted} text-sm`}>Mentors</p>
                <p className="text-2xl font-bold text-purple-400">
                  {users.filter(u => u.role === 'mentor').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`${theme.glass} rounded-xl p-4 ${theme.border.primary} border`}>
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-cyan-400" />
              <div>
                <p className={`${theme.text.muted} text-sm`}>Mentees</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {users.filter(u => u.role === 'mentee').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label className={theme.text.primary}>Search Users</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className={`${theme.input} pl-10`}
                />
              </div>
            </div>
            
            <div>
              <Label className={theme.text.primary}>Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className={`${theme.input} mt-2`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={theme.bg.card}>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="mentee">Mentees</SelectItem>
                  <SelectItem value="mentor">Mentors</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className={theme.text.primary}>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={`${theme.input} mt-2`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={theme.bg.card}>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className={`${theme.glass} rounded-xl ${theme.border.primary} border overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${theme.bg.secondary}`}>
                <tr>
                  <th className={`${theme.text.primary} text-left p-4 font-semibold`}>User</th>
                  <th className={`${theme.text.primary} text-left p-4 font-semibold`}>Role</th>
                  <th className={`${theme.text.primary} text-left p-4 font-semibold`}>Status</th>
                  <th className={`${theme.text.primary} text-left p-4 font-semibold`}>Plan</th>
                  <th className={`${theme.text.primary} text-left p-4 font-semibold`}>Quota</th>
                  <th className={`${theme.text.primary} text-left p-4 font-semibold`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`border-t ${theme.border.primary} hover:${theme.bg.secondary} transition-colors`}>
                    <td className="p-4">
                      <div>
                        <p className={`${theme.text.primary} font-medium`}>{user.name}</p>
                        <p className={`${theme.text.muted} text-sm`}>{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusBadge(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className={theme.text.secondary}>
                        {user.plan_name || 'No Plan'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className={theme.text.secondary}>
                          Interviews: <span className="font-semibold">{user.interview_quota_remaining || 0}</span>
                        </p>
                        <p className={theme.text.secondary}>
                          Resume: <span className="font-semibold">{user.resume_review_quota || 0}</span>
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Button
                        onClick={() => handleEditUser(user)}
                        size="sm"
                        className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Dialog */}
        {editDialog && (
          <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
            <DialogContent className={`${theme.glass} ${theme.border.primary} border max-w-2xl`}>
              <DialogHeader>
                <DialogTitle className={theme.text.primary}>Edit User: {editDialog.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={theme.text.primary}>Name</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className={`${theme.input} mt-2`}
                    />
                  </div>
                  
                  <div>
                    <Label className={theme.text.primary}>Email</Label>
                    <Input
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className={`${theme.input} mt-2`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={theme.text.primary}>Role</Label>
                    <Select value={editForm.role} onValueChange={(val) => setEditForm({...editForm, role: val})}>
                      <SelectTrigger className={`${theme.input} mt-2`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={theme.bg.card}>
                        <SelectItem value="mentee">Mentee</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className={theme.text.primary}>Status</Label>
                    <Select value={editForm.status} onValueChange={(val) => setEditForm({...editForm, status: val})}>
                      <SelectTrigger className={`${theme.input} mt-2`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={theme.bg.card}>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="Paused">Paused</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className={theme.text.primary}>Plan</Label>
                  <Select value={editForm.plan_id || "none"} onValueChange={(val) => setEditForm({...editForm, plan_id: val === "none" ? null : val})}>
                    <SelectTrigger className={`${theme.input} mt-2`}>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent className={theme.bg.card}>
                      <SelectItem value="none">No Plan</SelectItem>
                      {pricingPlans.map(plan => (
                        <SelectItem key={plan.plan_id} value={plan.plan_id}>
                          {plan.name} - ₹{plan.price / 100}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className={theme.text.primary}>New Password (leave empty to keep current)</Label>
                  <div className="relative mt-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={editForm.password}
                      onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                      className={`${theme.input} pr-10`}
                      placeholder="Enter new password..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={theme.text.primary}>Interview Quota</Label>
                    <Input
                      type="number"
                      value={editForm.interview_quota_remaining}
                      onChange={(e) => setEditForm({...editForm, interview_quota_remaining: parseInt(e.target.value) || 0})}
                      className={`${theme.input} mt-2`}
                    />
                  </div>
                  
                  <div>
                    <Label className={theme.text.primary}>Resume Review Quota</Label>
                    <Input
                      type="number"
                      value={editForm.resume_review_quota}
                      onChange={(e) => setEditForm({...editForm, resume_review_quota: parseInt(e.target.value) || 0})}
                      className={`${theme.input} mt-2`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditDialog(null)}
                    className={theme.button.secondary}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateUser}
                    className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUserManagement;
