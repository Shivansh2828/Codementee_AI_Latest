import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, DollarSign, CheckCircle, XCircle, Sparkles, TrendingUp, Crown, RefreshCw, Bot, Tag, Users, FileText, Ticket } from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useTheme } from "../../contexts/ThemeContext";
import api from "../../utils/api";

const SERVICE_TYPES = [
  { value: 'mock_interview', label: 'Mock Interview', icon: Sparkles },
  { value: 'mentorship', label: 'Mentorship', icon: Users },
  { value: 'resume_review', label: 'Resume Review', icon: FileText },
  { value: 'ai_agent', label: 'AI Agents', icon: Bot },
];

const SERVICE_TYPE_LABELS = {
  mock_interview: 'Mock Interview',
  mentorship: 'Mentorship',
  resume_review: 'Resume Review',
  ai_agent: 'AI Agents',
};

const planIcons = {
  'starter': Sparkles, 'pro': TrendingUp, 'elite': Crown,
  'agent_trial': Bot, 'agent_monthly': Bot, 'agent_quarterly': Bot,
};
const planColors = {
  'starter': 'text-blue-400', 'pro': 'text-[#06b6d4]', 'elite': 'text-amber-400',
  'agent_trial': 'text-purple-400', 'agent_monthly': 'text-purple-400', 'agent_quarterly': 'text-purple-400',
};

const INITIAL_PLAN_FORM = {
  plan_id: '', name: '', price: '', price_usd: '', duration_months: '1',
  features: '', limits: '', is_active: true, display_order: 1,
  service_type: 'mock_interview',
  sessions_count: '', session_duration_minutes: '', discount_percent: '',
  review_type: '', delivery_timeframe: '', session_duration: '',
};

const INITIAL_COUPON_FORM = {
  code: '', discount_type: 'percentage', discount_value: '',
  max_uses: '0', valid_from: '', valid_to: '',
  applicable_services: ['all'], is_active: true, min_order_amount: '0',
};

const AdminPricing = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('mock_interview');
  const [pricingPlans, setPricingPlans] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponsLoading, setCouponsLoading] = useState(false);

  // Plan dialog state
  const [editingPlan, setEditingPlan] = useState(null);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planForm, setPlanForm] = useState(INITIAL_PLAN_FORM);

  // Coupon dialog state
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState(INITIAL_COUPON_FORM);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const fetchPricingPlans = useCallback(async () => {
    try {
      const response = await api.get('/admin/pricing-plans');
      const sorted = response.data.sort((a, b) => a.display_order - b.display_order);
      setPricingPlans(sorted);
    } catch (error) {
      toast.error('Failed to fetch pricing plans');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCoupons = useCallback(async () => {
    setCouponsLoading(true);
    try {
      const response = await api.get('/admin/coupons');
      setCoupons(response.data);
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setCouponsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPricingPlans();
  }, [fetchPricingPlans]);

  useEffect(() => {
    if (activeTab === 'coupons') fetchCoupons();
  }, [activeTab, fetchCoupons]);

  // ---- Plan helpers ----
  const filteredPlans = pricingPlans.filter(p => (p.service_type || 'mock_interview') === activeTab);

  const handleNewPlan = () => {
    setEditingPlan(null);
    setPlanForm({ ...INITIAL_PLAN_FORM, service_type: activeTab });
    setIsPlanDialogOpen(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      plan_id: plan.plan_id || '',
      name: plan.name || '',
      price: plan.price ? (plan.price / 100).toString() : '',
      price_usd: plan.price_usd ? (plan.price_usd / 100).toString() : '',
      duration_months: plan.duration_months ? plan.duration_months.toString() : '1',
      features: plan.features ? plan.features.join('\n') : '',
      limits: JSON.stringify(plan.limits || {}, null, 2),
      is_active: plan.is_active !== undefined ? plan.is_active : true,
      display_order: plan.display_order ? plan.display_order.toString() : '1',
      service_type: plan.service_type || 'mock_interview',
      sessions_count: plan.sessions_count ? plan.sessions_count.toString() : '',
      session_duration_minutes: plan.session_duration_minutes ? plan.session_duration_minutes.toString() : '',
      discount_percent: plan.discount_percent ? plan.discount_percent.toString() : '',
      review_type: plan.review_type || '',
      delivery_timeframe: plan.delivery_timeframe || '',
      session_duration: plan.session_duration_minutes ? plan.session_duration_minutes.toString() : '',
    });
    setIsPlanDialogOpen(true);
  };

  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    setSavingPlan(true);
    try {
      const submitData = {
        name: planForm.name,
        service_type: planForm.service_type,
        price: parseInt(planForm.price) * 100 || 0,
        price_inr: parseInt(planForm.price) * 100 || 0,
        price_usd: parseInt(planForm.price_usd) * 100 || 0,
        duration_months: parseInt(planForm.duration_months),
        features: planForm.features.split('\n').filter(f => f.trim()),
        limits: planForm.limits ? JSON.parse(planForm.limits) : {},
        is_active: planForm.is_active,
        display_order: parseInt(planForm.display_order),
        currencies: ['INR', 'USD'],
      };
      // Mentorship-specific
      if (planForm.service_type === 'mentorship') {
        if (planForm.sessions_count) submitData.sessions_count = parseInt(planForm.sessions_count);
        if (planForm.session_duration_minutes) submitData.session_duration_minutes = parseInt(planForm.session_duration_minutes);
        if (planForm.discount_percent) submitData.discount_percent = parseFloat(planForm.discount_percent);
      }
      // Resume review-specific
      if (planForm.service_type === 'resume_review') {
        if (planForm.review_type) submitData.review_type = planForm.review_type;
        if (planForm.delivery_timeframe) submitData.delivery_timeframe = planForm.delivery_timeframe;
        if (planForm.review_type === 'call' && planForm.session_duration) {
          submitData.session_duration_minutes = parseInt(planForm.session_duration);
        }
      }

      if (editingPlan) {
        await api.put(`/admin/pricing-plans/${editingPlan.plan_id}`, submitData);
        toast.success('Pricing plan updated successfully');
      } else {
        await api.post('/admin/pricing-plans', { ...submitData, plan_id: planForm.plan_id });
        toast.success('Pricing plan created successfully');
      }
      setIsPlanDialogOpen(false);
      setPlanForm(INITIAL_PLAN_FORM);
      setEditingPlan(null);
      await fetchPricingPlans();
      setTimeout(() => handleSyncToWebsite(), 500);
    } catch (error) {
      if (error.message?.includes('JSON')) {
        toast.error('Invalid JSON format in limits field');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to save pricing plan');
      }
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      await api.delete(`/admin/pricing-plans/${planId}`);
      toast.success('Pricing plan deleted');
      fetchPricingPlans();
    } catch (error) {
      toast.error('Failed to delete pricing plan');
    }
  };

  const handleSyncToWebsite = async () => {
    setSyncing(true);
    try {
      await api.get('/pricing-plans', { params: { _t: Date.now() } });
      setLastSyncTime(new Date());
      toast.success('✅ Pricing synced! Users will see updates on next page refresh.');
    } catch (error) {
      toast.error('Failed to sync pricing');
    } finally {
      setSyncing(false);
    }
  };

  // ---- Coupon helpers ----
  const handleNewCoupon = () => {
    setEditingCoupon(null);
    setCouponForm(INITIAL_COUPON_FORM);
    setIsCouponDialogOpen(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: coupon.discount_value != null ? coupon.discount_value.toString() : '',
      max_uses: coupon.max_uses != null ? coupon.max_uses.toString() : '0',
      valid_from: coupon.valid_from ? coupon.valid_from.slice(0, 16) : '',
      valid_to: coupon.valid_to ? coupon.valid_to.slice(0, 16) : '',
      applicable_services: coupon.applicable_services || ['all'],
      is_active: coupon.is_active !== undefined ? coupon.is_active : true,
      min_order_amount: coupon.min_order_amount != null ? coupon.min_order_amount.toString() : '0',
    });
    setIsCouponDialogOpen(true);
  };

  const handleSubmitCoupon = async (e) => {
    e.preventDefault();
    setSavingCoupon(true);
    try {
      const submitData = {
        code: couponForm.code.toUpperCase(),
        discount_type: couponForm.discount_type,
        discount_value: parseFloat(couponForm.discount_value),
        max_uses: parseInt(couponForm.max_uses),
        valid_from: new Date(couponForm.valid_from).toISOString(),
        valid_to: new Date(couponForm.valid_to).toISOString(),
        applicable_services: couponForm.applicable_services,
        is_active: couponForm.is_active,
        min_order_amount: parseInt(couponForm.min_order_amount),
      };
      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon.id}`, submitData);
        toast.success('Coupon updated successfully');
      } else {
        await api.post('/admin/coupons', submitData);
        toast.success('Coupon created successfully');
      }
      setIsCouponDialogOpen(false);
      setCouponForm(INITIAL_COUPON_FORM);
      setEditingCoupon(null);
      await fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save coupon');
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      await api.put(`/admin/coupons/${coupon.id}`, { is_active: !coupon.is_active });
      toast.success(`Coupon ${coupon.is_active ? 'deactivated' : 'activated'}`);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update coupon');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    try {
      await api.delete(`/admin/coupons/${couponId}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const toggleCouponService = (service) => {
    setCouponForm(prev => {
      let services = [...prev.applicable_services];
      if (service === 'all') return { ...prev, applicable_services: ['all'] };
      services = services.filter(s => s !== 'all');
      if (services.includes(service)) {
        services = services.filter(s => s !== service);
      } else {
        services.push(service);
      }
      if (services.length === 0) services = ['all'];
      return { ...prev, applicable_services: services };
    });
  };

  // ---- Render helpers ----

  const renderPlanCard = (plan) => {
    const Icon = planIcons[plan.plan_id] || DollarSign;
    const iconColor = planColors[plan.plan_id] || 'text-[#06b6d4]';
    const isPopular = plan.plan_id === 'pro' || plan.plan_id === 'agent_monthly';

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
                <CheckCircle className="w-3 h-3 mr-1" />Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                <XCircle className="w-3 h-3 mr-1" />Inactive
              </Badge>
            )}
          </div>
          <CardDescription className={theme.text.secondary}>
            Plan ID: {plan.plan_id} • Order: {plan.display_order}
            {plan.service_type && plan.service_type !== 'mock_interview' && (
              <> • Type: {SERVICE_TYPE_LABELS[plan.service_type]}</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-xs ${theme.text.muted} mb-1`}>India Price</p>
                <div className="flex items-baseline gap-1">
                  <span className={`${theme.text.secondary} text-lg`}>₹</span>
                  <span className={`text-3xl font-bold ${theme.text.primary}`}>
                    {(plan.price / 100).toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <p className={`text-xs ${theme.text.muted} mb-1`}>International Price</p>
                <div className="flex items-baseline gap-1">
                  <span className={`${theme.text.secondary} text-lg`}>$</span>
                  <span className={`text-3xl font-bold ${theme.text.primary}`}>
                    {plan.price_usd ? (plan.price_usd / 100).toFixed(0) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Service-specific info */}
            {plan.service_type === 'mentorship' && (plan.sessions_count || plan.session_duration_minutes || plan.discount_percent) && (
              <div className={`space-y-1 pt-2 border-t ${theme.border.primary}`}>
                <h4 className={`font-medium ${theme.text.primary} text-sm`}>Mentorship Details:</h4>
                <div className="text-sm space-y-1">
                  {plan.sessions_count && (
                    <div className={`flex justify-between ${theme.text.secondary}`}>
                      <span>Sessions:</span><span className="font-medium text-[#06b6d4]">{plan.sessions_count}</span>
                    </div>
                  )}
                  {plan.session_duration_minutes && (
                    <div className={`flex justify-between ${theme.text.secondary}`}>
                      <span>Duration:</span><span className="font-medium text-[#06b6d4]">{plan.session_duration_minutes} min</span>
                    </div>
                  )}
                  {plan.discount_percent > 0 && (
                    <div className={`flex justify-between ${theme.text.secondary}`}>
                      <span>Discount:</span><span className="font-medium text-green-400">{plan.discount_percent}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {plan.service_type === 'resume_review' && (plan.review_type || plan.delivery_timeframe) && (
              <div className={`space-y-1 pt-2 border-t ${theme.border.primary}`}>
                <h4 className={`font-medium ${theme.text.primary} text-sm`}>Review Details:</h4>
                <div className="text-sm space-y-1">
                  {plan.review_type && (
                    <div className={`flex justify-between ${theme.text.secondary}`}>
                      <span>Type:</span><span className="font-medium text-[#06b6d4] capitalize">{plan.review_type}</span>
                    </div>
                  )}
                  {plan.delivery_timeframe && (
                    <div className={`flex justify-between ${theme.text.secondary}`}>
                      <span>Delivery:</span><span className="font-medium text-[#06b6d4]">{plan.delivery_timeframe}</span>
                    </div>
                  )}
                  {plan.review_type === 'call' && plan.session_duration_minutes && (
                    <div className={`flex justify-between ${theme.text.secondary}`}>
                      <span>Call Duration:</span><span className="font-medium text-[#06b6d4]">{plan.session_duration_minutes} min</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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
              <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)} className="flex-1">
                <Edit className="w-4 h-4 mr-2" />Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button>
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
                    <AlertDialogAction onClick={() => handleDeletePlan(plan.plan_id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ---- Plan Dialog ----
  const renderPlanDialog = () => (
    <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${theme.bg.card} ${theme.border.primary} border`}>
        <DialogHeader>
          <DialogTitle className={theme.text.primary}>
            {editingPlan ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}
          </DialogTitle>
          <DialogDescription className={theme.text.secondary}>
            {editingPlan ? 'Update the pricing plan details' : 'Add a new pricing plan'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmitPlan} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan_id" className={theme.text.primary}>Plan ID</Label>
              <Input id="plan_id" value={planForm.plan_id}
                onChange={(e) => setPlanForm({...planForm, plan_id: e.target.value})}
                placeholder="e.g., starter, mentorship_1m" disabled={!!editingPlan} required
                className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_type" className={theme.text.primary}>Service Type</Label>
              <Select value={planForm.service_type} onValueChange={(v) => setPlanForm({...planForm, service_type: v})} disabled={!!editingPlan}>
                <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(st => (
                    <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className={theme.text.primary}>Plan Name</Label>
            <Input id="name" value={planForm.name}
              onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
              placeholder="e.g., Mock Starter, Mentorship 1 Month" required
              className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className={theme.text.primary}>Price INR (₹)</Label>
              <Input id="price" type="number" value={planForm.price}
                onChange={(e) => setPlanForm({...planForm, price: e.target.value})}
                placeholder="2999" required
                className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`} />
              <p className={`text-xs ${theme.text.muted}`}>Price in rupees (stored as paise)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_usd" className={theme.text.primary}>Price USD ($)</Label>
              <Input id="price_usd" type="number" value={planForm.price_usd}
                onChange={(e) => setPlanForm({...planForm, price_usd: e.target.value})}
                placeholder="36" required
                className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`} />
              <p className={`text-xs ${theme.text.muted}`}>Price in dollars (stored as cents)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_months" className={theme.text.primary}>Duration (Months)</Label>
              <Input id="duration_months" type="number" value={planForm.duration_months}
                onChange={(e) => setPlanForm({...planForm, duration_months: e.target.value})}
                placeholder="1" required
                className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_order" className={theme.text.primary}>Display Order</Label>
              <Input id="display_order" type="number" value={planForm.display_order}
                onChange={(e) => setPlanForm({...planForm, display_order: e.target.value})}
                placeholder="1" required
                className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`} />
            </div>
          </div>

          {/* Mentorship-specific fields */}
          {planForm.service_type === 'mentorship' && (
            <div className={`space-y-4 p-4 rounded-lg border ${theme.border.primary} ${theme.bg.secondary}`}>
              <h4 className={`font-medium ${theme.text.primary} flex items-center gap-2`}>
                <Users className="w-4 h-4 text-[#06b6d4]" /> Mentorship Details
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className={theme.text.primary}>Sessions Count</Label>
                  <Input type="number" value={planForm.sessions_count}
                    onChange={(e) => setPlanForm({...planForm, sessions_count: e.target.value})}
                    placeholder="4"
                    className={`${theme.bg.card} ${theme.border.primary} ${theme.text.primary}`} />
                </div>
                <div className="space-y-2">
                  <Label className={theme.text.primary}>Session Duration (min)</Label>
                  <Input type="number" value={planForm.session_duration_minutes}
                    onChange={(e) => setPlanForm({...planForm, session_duration_minutes: e.target.value})}
                    placeholder="60"
                    className={`${theme.bg.card} ${theme.border.primary} ${theme.text.primary}`} />
                </div>
                <div className="space-y-2">
                  <Label className={theme.text.primary}>Discount %</Label>
                  <Input type="number" value={planForm.discount_percent}
                    onChange={(e) => setPlanForm({...planForm, discount_percent: e.target.value})}
                    placeholder="0"
                    className={`${theme.bg.card} ${theme.border.primary} ${theme.text.primary}`} />
                </div>
              </div>
            </div>
          )}

          {/* Resume review-specific fields */}
          {planForm.service_type === 'resume_review' && (
            <div className={`space-y-4 p-4 rounded-lg border ${theme.border.primary} ${theme.bg.secondary}`}>
              <h4 className={`font-medium ${theme.text.primary} flex items-center gap-2`}>
                <FileText className="w-4 h-4 text-[#06b6d4]" /> Resume Review Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={theme.text.primary}>Review Type</Label>
                  <Select value={planForm.review_type} onValueChange={(v) => setPlanForm({...planForm, review_type: v})}>
                    <SelectTrigger className={`${theme.bg.card} ${theme.border.primary} ${theme.text.primary}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={theme.text.primary}>Delivery Timeframe</Label>
                  <Input value={planForm.delivery_timeframe}
                    onChange={(e) => setPlanForm({...planForm, delivery_timeframe: e.target.value})}
                    placeholder="5 business days"
                    className={`${theme.bg.card} ${theme.border.primary} ${theme.text.primary}`} />
                </div>
              </div>
              {planForm.review_type === 'call' && (
                <div className="space-y-2">
                  <Label className={theme.text.primary}>Call Duration (min)</Label>
                  <Input type="number" value={planForm.session_duration}
                    onChange={(e) => setPlanForm({...planForm, session_duration: e.target.value})}
                    placeholder="45"
                    className={`${theme.bg.card} ${theme.border.primary} ${theme.text.primary}`} />
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="features" className={theme.text.primary}>Features (one per line)</Label>
            <Textarea id="features" value={planForm.features}
              onChange={(e) => setPlanForm({...planForm, features: e.target.value})}
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3" rows={5}
              className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="limits" className={theme.text.primary}>Usage Limits (JSON)</Label>
            <Textarea id="limits" value={planForm.limits}
              onChange={(e) => setPlanForm({...planForm, limits: e.target.value})}
              placeholder='{"mock_interviews": 1}' rows={3}
              className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary} font-mono text-sm`} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="is_active" checked={planForm.is_active}
              onCheckedChange={(checked) => setPlanForm({...planForm, is_active: checked})} />
            <Label htmlFor="is_active" className={theme.text.primary}>Active</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsPlanDialogOpen(false)} disabled={savingPlan}>Cancel</Button>
            <Button type="submit" disabled={savingPlan}>
              {savingPlan ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Create Plan')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  // ---- Coupon Dialog ----
  const renderCouponDialog = () => (
    <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${theme.bg.card} ${theme.border.primary} border`}>
        <DialogHeader>
          <DialogTitle className={theme.text.primary}>
            {editingCoupon ? 'Edit Coupon Code' : 'Create New Coupon Code'}
          </DialogTitle>
          <DialogDescription className={theme.text.secondary}>
            {editingCoupon ? 'Update coupon details' : 'Create a promotional coupon code'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmitCoupon} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={theme.text.primary}>Coupon Code</Label>
              <Input value={couponForm.code}
                onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                placeholder="LAUNCH20" required disabled={!!editingCoupon}
                className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary} uppercase`} />
            </div>
            <div className="space-y-2">
              <Label className={theme.text.primary}>Discount Type</Label>
              <Select value={couponForm.discount_type} onValueChange={(v) => setCouponForm({...couponForm, discount_type: v})}>
                <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={theme.text.primary}>
                Discount Value {couponForm.discount_type === 'percentage' ? '(%)' : '(paise/cents)'}
              </Label>
              <Input type="number" value={couponForm.discount_value}
                onChange={(e) => setCouponForm({...couponForm, discount_value: e.target.value})}
                placeholder={couponForm.discount_type === 'percentage' ? '20' : '50000'} required
                className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`} />
            </div>
            <div className="space-y-2">
              <Label className={theme.text.primary}>Max Uses (0 = unlimited)</Label>
              <Input type="number" value={couponForm.max_uses}
                onChange={(e) => setCouponForm({...couponForm, max_uses: e.target.value})}
                placeholder="0"
                className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={theme.text.primary}>Valid From</Label>
              <Input type="datetime-local" value={couponForm.valid_from}
                onChange={(e) => setCouponForm({...couponForm, valid_from: e.target.value})} required
                className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`} />
            </div>
            <div className="space-y-2">
              <Label className={theme.text.primary}>Valid To</Label>
              <Input type="datetime-local" value={couponForm.valid_to}
                onChange={(e) => setCouponForm({...couponForm, valid_to: e.target.value})} required
                className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={theme.text.primary}>Min Order Amount (paise, 0 = none)</Label>
            <Input type="number" value={couponForm.min_order_amount}
              onChange={(e) => setCouponForm({...couponForm, min_order_amount: e.target.value})}
              placeholder="0"
              className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`} />
          </div>
          <div className="space-y-2">
            <Label className={theme.text.primary}>Applicable Services</Label>
            <div className="flex flex-wrap gap-2">
              {[{ value: 'all', label: 'All Services' }, ...SERVICE_TYPES].map(s => {
                const isSelected = couponForm.applicable_services.includes(s.value);
                return (
                  <button key={s.value} type="button"
                    onClick={() => toggleCouponService(s.value)}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      isSelected
                        ? 'bg-[#06b6d4] text-white border-[#06b6d4]'
                        : `${theme.bg.secondary} ${theme.text.secondary} ${theme.border.primary}`
                    }`}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="coupon_active" checked={couponForm.is_active}
              onCheckedChange={(checked) => setCouponForm({...couponForm, is_active: checked})} />
            <Label htmlFor="coupon_active" className={theme.text.primary}>Active</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCouponDialogOpen(false)} disabled={savingCoupon}>Cancel</Button>
            <Button type="submit" disabled={savingCoupon}>
              {savingCoupon ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Create Coupon')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  // ---- Coupons Tab Content ----
  const renderCouponsTab = () => {
    if (couponsLoading) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className={`text-lg ${theme.text.primary}`}>Loading coupons...</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className={`text-xl font-semibold ${theme.text.primary} flex items-center gap-2`}>
            <Ticket className="w-5 h-5 text-[#06b6d4]" /> Coupon Codes
          </h2>
          <Button onClick={handleNewCoupon} className="bg-[#06b6d4] hover:bg-[#0891b2]">
            <Plus className="w-4 h-4 mr-2" /> Add Coupon
          </Button>
        </div>

        {coupons.length === 0 ? (
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag className={`w-12 h-12 ${theme.text.muted} mb-4`} />
              <h3 className={`text-lg font-medium mb-2 ${theme.text.primary}`}>No coupons found</h3>
              <p className={`${theme.text.secondary} text-center mb-4`}>Create your first coupon code to get started.</p>
              <Button onClick={handleNewCoupon}><Plus className="w-4 h-4 mr-2" />Create First Coupon</Button>
            </CardContent>
          </Card>
        ) : (
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${theme.border.primary}`}>
                      {['Code', 'Discount', 'Services', 'Usage', 'Status', 'Valid Period', 'Actions'].map(h => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-medium ${theme.text.muted} uppercase tracking-wider`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.border.primary}`}>
                    {coupons.map(coupon => {
                      const isExpired = new Date(coupon.valid_to) < new Date();
                      const usageFull = coupon.max_uses > 0 && coupon.current_uses >= coupon.max_uses;
                      return (
                        <tr key={coupon.id} className={theme.bg.hover}>
                          <td className={`px-4 py-3 ${theme.text.primary} font-mono font-medium`}>{coupon.code}</td>
                          <td className={`px-4 py-3 ${theme.text.secondary}`}>
                            {coupon.discount_type === 'percentage'
                              ? `${coupon.discount_value}%`
                              : `₹${(coupon.discount_value / 100).toLocaleString()}`}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {coupon.applicable_services?.map(s => (
                                <Badge key={s} variant="outline" className="text-xs">
                                  {s === 'all' ? 'All' : SERVICE_TYPE_LABELS[s] || s}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className={`px-4 py-3 ${theme.text.secondary}`}>
                            {coupon.current_uses}/{coupon.max_uses === 0 ? '∞' : coupon.max_uses}
                          </td>
                          <td className="px-4 py-3">
                            {isExpired ? (
                              <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Expired</Badge>
                            ) : usageFull ? (
                              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Limit Reached</Badge>
                            ) : coupon.is_active ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Inactive</Badge>
                            )}
                          </td>
                          <td className={`px-4 py-3 text-xs ${theme.text.muted}`}>
                            <div>{new Date(coupon.valid_from).toLocaleDateString()}</div>
                            <div>to {new Date(coupon.valid_to).toLocaleDateString()}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Switch checked={coupon.is_active} onCheckedChange={() => handleToggleCoupon(coupon)} />
                              <Button variant="outline" size="sm" onClick={() => handleEditCoupon(coupon)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm"><Trash2 className="w-3 h-3" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className={`${theme.bg.card} ${theme.border.primary} border`}>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className={theme.text.primary}>Delete Coupon</AlertDialogTitle>
                                    <AlertDialogDescription className={theme.text.secondary}>
                                      Delete coupon "{coupon.code}"? This cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCoupon(coupon.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ---- Service Plans Tab Content ----
  const renderServicePlansTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${theme.text.primary} flex items-center gap-2`}>
          {SERVICE_TYPES.find(s => s.value === activeTab)?.icon &&
            React.createElement(SERVICE_TYPES.find(s => s.value === activeTab).icon, { className: 'w-5 h-5 text-[#06b6d4]' })}
          {SERVICE_TYPE_LABELS[activeTab]} Plans
        </h2>
        <Button onClick={handleNewPlan} className="bg-[#06b6d4] hover:bg-[#0891b2]">
          <Plus className="w-4 h-4 mr-2" /> Add Plan
        </Button>
      </div>
      {filteredPlans.length === 0 ? (
        <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className={`w-12 h-12 ${theme.text.muted} mb-4`} />
            <h3 className={`text-lg font-medium mb-2 ${theme.text.primary}`}>No {SERVICE_TYPE_LABELS[activeTab]} plans</h3>
            <p className={`${theme.text.secondary} text-center mb-4`}>Create your first {SERVICE_TYPE_LABELS[activeTab]} plan.</p>
            <Button onClick={handleNewPlan}><Plus className="w-4 h-4 mr-2" />Create Plan</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map(renderPlanCard)}
        </div>
      )}
    </div>
  );

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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text.primary}`}>Pricing Management</h1>
            <p className={theme.text.secondary}>
              Manage pricing plans and coupon codes for all services
              {lastSyncTime && (
                <span className="ml-3 text-xs text-green-400">
                  • Last synced: {lastSyncTime.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <Button onClick={handleSyncToWebsite} disabled={syncing} variant="outline"
            className="border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4] hover:text-white">
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync to Website'}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`${theme.bg.secondary} ${theme.border.primary} border`}>
            {SERVICE_TYPES.map(st => (
              <TabsTrigger key={st.value} value={st.value} className="flex items-center gap-1.5 data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white">
                <st.icon className="w-4 h-4" /> {st.label}
              </TabsTrigger>
            ))}
            <TabsTrigger value="coupons" className="flex items-center gap-1.5 data-[state=active]:bg-[#06b6d4] data-[state=active]:text-white">
              <Ticket className="w-4 h-4" /> Coupon Codes
            </TabsTrigger>
          </TabsList>

          {SERVICE_TYPES.map(st => (
            <TabsContent key={st.value} value={st.value}>
              {renderServicePlansTab()}
            </TabsContent>
          ))}
          <TabsContent value="coupons">
            {renderCouponsTab()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {renderPlanDialog()}
      {renderCouponDialog()}
    </DashboardLayout>
  );
};

export default AdminPricing;
