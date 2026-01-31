import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { toast } from "sonner";
import { Users, MessageSquare, Plus, ThumbsUp, ThumbsDown, MessageCircle, Calendar, User, Hash, Search } from "lucide-react";
import api from "../../utils/api";

const MenteeCommunity = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

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
      if (selectedCategory) params.category = selectedCategory;
      
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Community Forum</h1>
            <p className="text-slate-400">Connect with fellow mentees, share experiences, and get help</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#0f172a]">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1e293b] border-[#334155] max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Post</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Share your thoughts, ask questions, or start a discussion
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Title *</Label>
                  <Input
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    placeholder="Enter post title..."
                    className="bg-[#0f172a] border-[#334155] text-white placeholder-slate-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Category *</Label>
                  <Select value={newPost.category} onValueChange={(value) => setNewPost({...newPost, category: value})}>
                    <SelectTrigger className="bg-[#0f172a] border-[#334155] text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-[#334155]">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="text-white hover:bg-[#334155]">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Content *</Label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    placeholder="Write your post content..."
                    className="min-h-[120px] bg-[#0f172a] border-[#334155] text-white placeholder-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Tags (Optional)</Label>
                  <Input
                    value={newPost.tags}
                    onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                    placeholder="Enter tags separated by commas..."
                    className="bg-[#0f172a] border-[#334155] text-white placeholder-slate-400"
                  />
                  <p className="text-xs text-slate-400">e.g., javascript, system-design, amazon</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-[#334155] text-white hover:bg-[#334155]">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts..."
                className="pl-10 bg-[#1e293b] border-[#334155] text-white placeholder-slate-400"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 bg-[#1e293b] border-[#334155] text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-[#334155]">
              <SelectItem value="" className="text-white hover:bg-[#334155]">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} className="text-white hover:bg-[#334155]">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              selectedCategory === '' 
                ? 'bg-[#06b6d4] text-[#0f172a]' 
                : 'bg-[#1e293b] text-slate-300 border border-[#334155] hover:border-[#06b6d4]/50'
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
                  : 'bg-[#1e293b] text-slate-300 border border-[#334155] hover:border-[#06b6d4]/50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-12 h-12 text-slate-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No posts found</h3>
              <p className="text-slate-400 text-center mb-4">
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
                <Card key={post.id} className="bg-[#1e293b] border-[#334155] hover:border-[#06b6d4]/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#06b6d4]/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-[#06b6d4]" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{post.author_name}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
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

                    <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                    <p className="text-slate-300 mb-4 line-clamp-3">{post.content}</p>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-[#334155] text-slate-400">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-slate-400 hover:text-green-400 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{post.upvotes || 0}</span>
                        </button>
                        <button className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors">
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-sm">{post.downvotes || 0}</span>
                        </button>
                        <div className="flex items-center gap-1 text-slate-400">
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