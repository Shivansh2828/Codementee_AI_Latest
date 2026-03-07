import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { toast } from "sonner";
import { Users, MessageSquare, Plus, ThumbsUp, ThumbsDown, MessageCircle, Calendar, User, Hash, Search, Crown, Lock, ExternalLink } from "lucide-react";
import { Link } from 'react-router-dom';
import api from "../../utils/api";

const MenteeCommunity = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isFreeUser = user?.status === 'Free' || !user?.plan_id;
  const hasAccess = ['pro', 'elite'].includes(user?.plan_id);
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  // Show WhatsApp banner and upgrade prompt for users without access
  if (!hasAccess) {
    return (
      <DashboardLayout title="Community">
        <div className="space-y-6">
          {/* WhatsApp Community Banner - Always visible */}
          <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/30 border-2">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-10 h-10 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${theme.text.primary} mb-1 flex items-center gap-2`}>
                      Join Our WhatsApp Community
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                    </h3>
                    <p className={`${theme.text.secondary} text-sm`}>
                      Connect with 500+ mentees, share experiences, get instant help, and access exclusive resources
                    </p>
                  </div>
                </div>
                <a
                  href="https://chat.whatsapp.com/JfTdNnlldX2G2s89r5JhqY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 h-auto">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Join WhatsApp Group
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
              
              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-green-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className={`${theme.text.primary} font-medium text-sm`}>Active Community</p>
                    <p className={`${theme.text.secondary} text-xs`}>500+ members sharing daily</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className={`${theme.text.primary} font-medium text-sm`}>Instant Support</p>
                    <p className={`${theme.text.secondary} text-xs`}>Get quick answers & tips</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Crown className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className={`${theme.text.primary} font-medium text-sm`}>Exclusive Resources</p>
                    <p className={`${theme.text.secondary} text-xs`}>Interview tips & referrals</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Prompt for Forum Access */}
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className={`text-2xl font-bold ${theme.text.primary} mb-4`}>
              {isFreeUser ? 'Upgrade to Access Community Forum' : 'Upgrade to Pro or Elite'}
            </h2>
            <p className={`${theme.text.secondary} mb-8 max-w-2xl mx-auto`}>
              Get access to our exclusive community forum to connect with other mentees, share interview experiences, ask questions, and get referrals. Forum access is available with Pro and Elite plans.
            </p>
            <Link to="/mentee/book">
              <Button className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white px-8 py-3">
                <Crown className="w-5 h-5 mr-2" />
                View Plans & Upgrade
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const categories = [
    { id: 'general', name: 'General Discussion', color: 'bg-blue-500/20 text-blue-400' },
    { id: 'technical', name: 'Technical Questions', color: 'bg-green-500/20 text-green-400' },
    { id: 'behavioral', name: 'Behavioral Prep', color: 'bg-purple-500/20 text-purple-400' },
    { id: 'offers', name: 'Offers & Negotiations', color: 'bg-yellow-500/20 text-yellow-400' },
    { id: 'referrals', name: 'Referrals', color: 'bg-red-500/20 text-red-400' }
  ];

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      
      const response = await api.get('/community/posts', { params });
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to fetch posts');
      console.error('Fetch posts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const postData = {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await api.post('/community/posts', postData);
      toast.success('Post created successfully!');
      setIsCreateDialogOpen(false);
      setNewPost({ title: '', content: '', category: '', tags: '' });
      fetchPosts();
    } catch (error) {
      toast.error('Failed to create post');
      console.error('Create post error:', error);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || { name: categoryId, color: 'bg-gray-500/20 text-gray-400' };
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Community Forum">
      <div className="space-y-6">
        {/* WhatsApp Community Banner */}
        <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/30 border-2">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${theme.text.primary} mb-1 flex items-center gap-2`}>
                    Join Our WhatsApp Community
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                  </h3>
                  <p className={`${theme.text.secondary} text-sm`}>
                    Connect with 500+ mentees, share experiences, get instant help, and access exclusive resources
                  </p>
                </div>
              </div>
              <a
                href="https://chat.whatsapp.com/JfTdNnlldX2G2s89r5JhqY"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 h-auto">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Join WhatsApp Group
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
            
            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-green-500/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Active Community</p>
                  <p className="text-gray-400 text-xs">500+ members sharing daily</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Instant Support</p>
                  <p className="text-gray-400 text-xs">Get quick answers & tips</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Crown className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Exclusive Resources</p>
                  <p className="text-gray-400 text-xs">Interview tips & referrals</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>Community Forum</h1>
            <p className={theme.text.secondary}>Connect with fellow mentees, share experiences, and get help</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#0f172a]">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className={`${theme.bg.card} ${theme.border.primary} border max-w-2xl`}>
              <DialogHeader>
                <DialogTitle className={theme.text.primary}>Create New Post</DialogTitle>
                <DialogDescription className={theme.text.secondary}>
                  Share your thoughts, ask questions, or start a discussion
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className={theme.text.primary}>Title *</Label>
                  <Input
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    placeholder="Enter post title..."
                    className={theme.input.base}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className={theme.text.primary}>Category *</Label>
                  <Select value={newPost.category} onValueChange={(value) => setNewPost({...newPost, category: value})}>
                    <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary} border`}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className={`${theme.bg.card} ${theme.border.primary} border`}>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className={`${theme.text.primary} ${theme.bg.hover}`}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className={theme.text.primary}>Content *</Label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    placeholder="Write your post content..."
                    className={`min-h-[120px] ${theme.input.base}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={theme.text.primary}>Tags (Optional)</Label>
                  <Input
                    value={newPost.tags}
                    onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                    placeholder="Enter tags separated by commas..."
                    className={theme.input.base}
                  />
                  <p className={`text-xs ${theme.text.muted}`}>e.g., javascript, system-design, amazon</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className={`${theme.border.primary} ${theme.text.primary} ${theme.bg.hover} border`}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost} className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#0f172a]">
                  Create Post
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.text.muted} w-4 h-4`} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts..."
                className={`pl-10 ${theme.input.base}`}
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className={`w-full sm:w-48 ${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary} border`}>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className={`${theme.bg.card} ${theme.border.primary} border`}>
              <SelectItem value="all" className={`${theme.text.primary} ${theme.bg.hover}`}>All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} className={`${theme.text.primary} ${theme.bg.hover}`}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              selectedCategory === 'all' 
                ? 'bg-[#06b6d4] text-[#0f172a]' 
                : `${theme.bg.secondary} ${theme.text.secondary} border ${theme.border.primary} hover:border-[#06b6d4]/50`
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedCategory === category.id 
                  ? 'bg-[#06b6d4] text-[#0f172a]' 
                  : `${theme.bg.secondary} ${theme.text.secondary} border ${theme.border.primary} hover:border-[#06b6d4]/50`
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {loading ? (
          <div className={`text-center py-12 ${theme.text.secondary}`}>Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className={`w-12 h-12 ${theme.text.muted} mb-4`} />
              <h3 className={`text-lg font-medium ${theme.text.primary} mb-2`}>No posts found</h3>
              <p className={`${theme.text.secondary} text-center mb-4`}>
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Be the first to start a discussion in the community!'}
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#0f172a]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const categoryInfo = getCategoryInfo(post.category);
              return (
                <Card key={post.id} className={`${theme.bg.card} ${theme.border.primary} border hover:border-[#06b6d4]/30 transition-colors`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#06b6d4]/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-[#06b6d4]" />
                        </div>
                        <div>
                          <p className={`${theme.text.primary} font-medium`}>{post.author_name}</p>
                          <div className={`flex items-center gap-2 text-sm ${theme.text.muted}`}>
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.created_at)}
                          </div>
                        </div>
                      </div>
                      <Badge className={categoryInfo.color}>
                        <Hash className="w-3 h-3 mr-1" />
                        {categoryInfo.name}
                      </Badge>
                    </div>

                    <h3 className={`text-xl font-semibold ${theme.text.primary} mb-2`}>{post.title}</h3>
                    <p className={`${theme.text.secondary} mb-4 line-clamp-3`}>{post.content}</p>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className={`text-xs ${theme.border.primary} ${theme.text.muted} border`}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button className={`flex items-center gap-1 ${theme.text.muted} hover:text-green-400 transition-colors`}>
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{post.upvotes || 0}</span>
                        </button>
                        <button className={`flex items-center gap-1 ${theme.text.muted} hover:text-red-400 transition-colors`}>
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-sm">{post.downvotes || 0}</span>
                        </button>
                        <div className={`flex items-center gap-1 ${theme.text.muted}`}>
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{post.comment_count || 0} comments</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[#06b6d4] hover:bg-[#06b6d4]/10">
                        View Discussion
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MenteeCommunity;