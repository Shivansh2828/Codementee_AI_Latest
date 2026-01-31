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
import { Plus, Edit, Trash2, DollarSign, Calendar, CheckCircle, XCircle } from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import api from "../../utils/api";

const AdminPricing = () => {
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    plan_id: '',
    name: '',
    price: '',
    duration_months: '',
    features: '',
    limits: '',
    is_active: true,
    display_order: 1
  });

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      const response = await api.get('/admin/pricing-plans');
      setPricingPlans(response.data);
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
        ...formData,
        price: parseInt(formData.price) * 100, // Convert to paise
        duration_months: parseInt(formData.duration_months),
        features: formData.features.split('\n').filter(f => f.trim()),
        limits: formData.limits ? JSON.parse(formData.limits) : {},
        display_order: parseInt(formData.display_order)
      };

      if (editingPlan) {
        await api.put(`/admin/pricing-plans/${editingPlan.plan_id}`, submitData);
        toast.success('Pricing plan updated successfully');
      } else {
        await api.post('/admin/pricing-plans', submitData);
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
      plan_id: plan.plan_id,
      name: plan.name,
      price: (plan.price / 100).toString(), // Convert from paise
      duration_months: plan.duration_months.toString(),
      features: plan.features.join('\n'),
      limits: JSON.stringify(plan.limits || {}, null, 2),
      is_active: plan.is_active,
      display_order: plan.display_order.toString()
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
      duration_months: '',
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
          <div className="text-lg">Loading pricing plans...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Pricing Management</h1>
            <p className="text-muted-foreground">Manage subscription plans and pricing</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewPlan}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}
                </DialogTitle>
                <DialogDescription>
                  {editingPlan ? 'Update the pricing plan details' : 'Add a new subscription plan for mentees'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plan_id">Plan ID</Label>
                  <Input
                    id="plan_id"
                    value={formData.plan_id}
                    onChange={(e) => setFormData({...formData, plan_id: e.target.value})}
                    placeholder="e.g., monthly, quarterly"
                    disabled={editingPlan}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Monthly Plan"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="1999"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_months">Duration (Months)</Label>
                    <Input
                      id="duration_months"
                      type="number"
                      value={formData.duration_months}
                      onChange={(e) => setFormData({...formData, duration_months: e.target.value})}
                      placeholder="1"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features">Features (one per line)</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({...formData, features: e.target.value})}
                    placeholder="2 Mock Interviews/month&#10;Basic Resume Review (AI-powered)&#10;Community access"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limits">Usage Limits (JSON format)</Label>
                  <Textarea
                    id="limits"
                    value={formData.limits}
                    onChange={(e) => setFormData({...formData, limits: e.target.value})}
                    placeholder='{"mock_interviews": 2, "resume_reviews": 1, "ai_tools": 1}'
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Define usage limits in JSON format. Leave empty for no limits.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: e.target.value})}
                      placeholder="1"
                      required
                    />
                  </div>
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
          {pricingPlans.map((plan) => (
            <Card key={plan.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {plan.is_active ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold">
                    ₹{(plan.price / 100).toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{plan.duration_months === 1 ? 'month' : `${plan.duration_months} months`}
                    </span>
                  </div>
                  
                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Features:</h4>
                      <ul className="text-sm space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {plan.limits && Object.keys(plan.limits).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Usage Limits:</h4>
                      <div className="text-sm space-y-1">
                        {Object.entries(plan.limits).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                            <span className="font-medium">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
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
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Pricing Plan</AlertDialogTitle>
                          <AlertDialogDescription>
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
          ))}
        </div>

        {pricingPlans.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No pricing plans found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first pricing plan to get started with subscription management.
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