import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, DollarSign, CheckCircle, XCircle, Sparkles, TrendingUp, Crown } from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useTheme } from "../../contexts/ThemeContext";
import api from "../../utils/api";

const AdminPricing = () => {
  const { theme } = useTheme();
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    plan_id: '',
    name: '',
    price: '',
    duration_months: '1',
    features: '',
    limits: '',
    is_active: true,
    display_order: 1
  });

  const planIcons = {
    'starter': Sparkles,
    'pro': TrendingUp,
    'elite': Crown
  };

  const planColors = {
    'starter': 'text-blue-400',
    'pro': 'text-[#06b6d4]',
    'elite': 'text-amber-400'
  };

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      const response = await api.get('/admin/pricing-plans');
      // Sort by display_order
      const sorted = response.data.sort((a, b) => a.display_order - b.display_order);
      setPricingPlans(sorted);
    } catch (error) {
      toast.error('Failed to fetch pricing plans');
      console.error('Error fetching pricing plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        name: formData.name,
        price: parseInt(formData.price) * 100, // Convert to paise
        duration_months: parseInt(formData.duration_months),
        features: formData.features.split('\n').filter(f => f.trim()),
        limits: formData.limits ? JSON.parse(formData.limits) : {},
        is_active: formData.is_active,
        display_order: parseInt(formData.display_order)
      };

      if (editingPlan) {
        // Don't send plan_id in body for update
        await api.put(`/admin/pricing-plans/${editingPlan.plan_id}`, submitData);
        toast.success('Pricing plan updated successfully');
      } else {
        // Include plan_id only for create
        await api.post('/admin/pricing-plans', {
          ...submitData,
          plan_id: formData.plan_id
        });
        toast.success('Pricing plan created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPricingPlans();
    } catch (error) {
      if (error.message.includes('JSON')) {
        toast.error('Invalid JSON format in limits field');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to save pricing plan');
      }
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      plan_id: plan.plan_id || '',
      name: plan.name || '',
      price: plan.price ? (plan.price / 100).toString() : '',
      duration_months: plan.duration_months ? plan.duration_months.toString() : '1',
      features: plan.features ? plan.features.join('\n') : '',
      limits: JSON.stringify(plan.limits || {}, null, 2),
      is_active: plan.is_active !== undefined ? plan.is_active : true,
      display_order: plan.display_order ? plan.display_order.toString() : '1'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (planId) => {
    try {
      await api.delete(`/admin/pricing-plans/${planId}`);
      toast.success('Pricing plan deleted successfully');
      fetchPricingPlans();
    } catch (error) {
      toast.error('Failed to delete pricing plan');
    }
  };

  const resetForm = () => {
    setFormData({
      plan_id: '',
      name: '',
      price: '',
      duration_months: '1',
      features: '',
      limits: '',
      is_active: true,
      display_order: 1
    });
    setEditingPlan(null);
  };

  const handleNewPlan = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className={`text-lg ${theme.text.primary}`}>Loading pricing plans...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text.primary}`}>Pricing Management</h1>
            <p className={theme.text.secondary}>Manage interview preparation plans</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewPlan} className="bg-[#06b6d4] hover:bg-[#0891b2]">
                <Plus className="w-4 h-4 mr-2" />
                Add New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${theme.bg.card} ${theme.border.primary} border`}>
              <DialogHeader>
                <DialogTitle className={theme.text.primary}>
                  {editingPlan ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}
                </DialogTitle>
                <DialogDescription className={theme.text.secondary}>
                  {editingPlan ? 'Update the pricing plan details' : 'Add a new interview preparation plan'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plan_id" className={theme.text.primary}>Plan ID</Label>
                  <Input
                    id="plan_id"
                    value={formData.plan_id}
                    onChange={(e) => setFormData({...formData, plan_id: e.target.value})}
                    placeholder="e.g., starter, pro, elite"
                    disabled={editingPlan}
                    required
                    className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className={theme.text.primary}>Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Mock Starter, Interview Pro"
                    required
                    className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className={theme.text.primary}>Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="2999"
                      required
                      className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_order" className={theme.text.primary}>Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: e.target.value})}
                      placeholder="1"
                      required
                      className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features" className={theme.text.primary}>Features (one per line)</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({...formData, features: e.target.value})}
                    placeholder="1 MAANG-Level Mock Interview&#10;Detailed Feedback Report&#10;Resume Review (Email-based)"
                    rows={6}
                    className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limits" className={theme.text.primary}>Usage Limits (JSON format)</Label>
                  <Textarea
                    id="limits"
                    value={formData.limits}
                    onChange={(e) => setFormData({...formData, limits: e.target.value})}
                    placeholder='{"mock_interviews": 1, "resume_reviews": 1, "ai_tools": true}'
                    rows={4}
                    className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary} font-mono text-sm`}
                  />
                  <p className={`text-xs ${theme.text.muted}`}>
                    Define usage limits in JSON format. Leave empty for no limits.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active" className={theme.text.primary}>Active</Label>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pricingPlans.map((plan) => {
            const Icon = planIcons[plan.plan_id] || DollarSign;
            const iconColor = planColors[plan.plan_id] || 'text-[#06b6d4]';
            const isPopular = plan.plan_id === 'pro';
            
            return (
              <Card key={plan.id} className={`relative ${theme.bg.card} ${theme.border.primary} border ${isPopular ? 'ring-2 ring-[#06b6d4]' : ''}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#06b6d4] text-white px-3 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${theme.bg.secondary} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <CardTitle className={theme.text.primary}>{plan.name}</CardTitle>
                    </div>
                    {plan.is_active ? (
                      <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <CardDescription className={theme.text.secondary}>
                    Plan ID: {plan.plan_id} • Order: {plan.display_order}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <span className={`${theme.text.secondary} text-lg`}>₹</span>
                      <span className={`text-4xl font-bold ${theme.text.primary}`}>
                        {(plan.price / 100).toLocaleString()}
                      </span>
                    </div>
                    
                    {plan.features && plan.features.length > 0 && (
                      <div className="space-y-2">
                        <h4 className={`font-medium ${theme.text.primary} text-sm`}>Features:</h4>
                        <ul className="text-sm space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-[#06b6d4] mt-0.5 flex-shrink-0" />
                              <span className={theme.text.secondary}>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {plan.limits && Object.keys(plan.limits).length > 0 && (
                      <div className={`space-y-2 pt-2 border-t ${theme.border.primary}`}>
                        <h4 className={`font-medium ${theme.text.primary} text-sm`}>Usage Limits:</h4>
                        <div className="text-sm space-y-1">
                          {Object.entries(plan.limits).map(([key, value]) => (
                            <div key={key} className={`flex justify-between ${theme.text.secondary}`}>
                              <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                              <span className="font-medium text-[#06b6d4]">
                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className={`${theme.bg.card} ${theme.border.primary} border`}>
                          <AlertDialogHeader>
                            <AlertDialogTitle className={theme.text.primary}>Delete Pricing Plan</AlertDialogTitle>
                            <AlertDialogDescription className={theme.text.secondary}>
                              Are you sure you want to delete "{plan.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(plan.plan_id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {pricingPlans.length === 0 && (
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className={`w-12 h-12 ${theme.text.muted} mb-4`} />
              <h3 className={`text-lg font-medium mb-2 ${theme.text.primary}`}>No pricing plans found</h3>
              <p className={`${theme.text.secondary} text-center mb-4`}>
                Create your first pricing plan to get started.
              </p>
              <Button onClick={handleNewPlan}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Plan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPricing;
