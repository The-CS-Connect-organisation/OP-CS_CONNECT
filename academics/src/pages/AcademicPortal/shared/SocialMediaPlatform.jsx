import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageCircle,
  Plus,
  Search,
  Filter,
  Heart,
  MessageSquare,
  Share2,
  Edit,
  Trash2,
  UserPlus,
  Users2,
  Calendar,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { request } from '../../../utils/apiClient';

const PostCard = ({ post, user, onLike, onDelete, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onComment(post.id, {
        id: Date.now().toString(),
        content: newComment,
        authorId: user.id,
        createdAt: new Date().toISOString()
      });
      setNewComment('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="nova-card p-6"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {post.authorName.charAt(0)}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{post.authorName}</h4>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar size={14} />
              {new Date(post.createdAt).toLocaleDateString()}
              <Clock size={14} />
              {new Date(post.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {user.id === post.authorId && (
            <>
              <button className="btn-ghost">
                <Edit size={16} />
              </button>
              <button className="btn-ghost text-red-600" onClick={() => onDelete(post.id)}>
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        <p className="text-gray-600 mb-4">{post.content}</p>
        
        {post.imageUrl && (
          <img src={post.imageUrl} alt="Post" className="w-full h-48 object-cover rounded-lg mb-4" />
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 transition-colors ${
              post.likes?.includes(user.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart size={18} fill={post.likes?.includes(user.id) ? 'currentColor' : 'none'} />
            <span>{post.likes?.length || 0}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <MessageSquare size={18} />
            <span>{post.comments?.length || 0} Comments</span>
          </button>
          
          <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>
        
        <span className="text-sm text-gray-400 flex items-center gap-1">
          <Eye size={14} />
          {post.views || 0} views
        </span>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            {/* New Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-4">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary">Comment</button>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {post.comments?.map(comment => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{comment.authorName}</span>
                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const GroupCard = ({ group, user, onJoin, onLeave }) => {
  const isMember = group.members?.includes(user.id);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="nova-card p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {group.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{group.name}</h3>
              <p className="text-sm text-gray-500">{group.members?.length || 0} members</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">{group.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className={`px-2 py-1 rounded-full text-xs ${
              group.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {group.visibility.toUpperCase()}
            </span>
            <span>• Created: {new Date(group.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isMember ? (
            <button onClick={() => onLeave(group.id)} className="btn-secondary">
              Leave Group
            </button>
          ) : (
            <button onClick={() => onJoin(group.id)} className="btn-primary">
              Join Group
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const SocialMediaPlatform = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      request('/school/social/posts'),
      request('/school/social/groups'),
      request('/school/users'),
    ]).then(([pRes, gRes, uRes]) => {
      if (pRes.status === 'fulfilled') setPosts(pRes.value?.posts || []);
      if (gRes.status === 'fulfilled') setGroups(gRes.value?.groups || []);
      if (uRes.status === 'fulfilled') setUsers(uRes.value?.items || uRes.value?.users || []);
    });
  }, []);
  
  const [activeTab, setActiveTab] = useState('feed');
  const [search, setSearch] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const userGroups = groups.filter(group => group.members?.includes(user.id));
  const publicGroups = groups.filter(group => group.visibility === 'public' && !group.members?.includes(user.id));

  const handleLike = async (postId) => {
    const post = posts.find(p => p.id === postId);
    const likes = post.likes || [];
    const newLikes = likes.includes(user.id)
      ? likes.filter(id => id !== user.id)
      : [...likes, user.id];
    try { await request(`/school/social/posts/${postId}`, { method: 'PATCH', body: JSON.stringify({ likes: newLikes }) }); } catch {}
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
  };

  const handleComment = async (postId, comment) => {
    const post = posts.find(p => p.id === postId);
    const comments = post.comments || [];
    const newComments = [...comments, { ...comment, authorName: user.name }];
    try { await request(`/school/social/posts/${postId}`, { method: 'PATCH', body: JSON.stringify({ comments: newComments }) }); } catch {}
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: newComments } : p));
  };

  const handleJoinGroup = async (groupId) => {
    const group = groups.find(g => g.id === groupId);
    const members = [...(group.members || []), user.id];
    try { await request(`/school/social/groups/${groupId}`, { method: 'PATCH', body: JSON.stringify({ members }) }); } catch {}
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, members } : g));
  };

  const handleLeaveGroup = async (groupId) => {
    const group = groups.find(g => g.id === groupId);
    const members = (group.members || []).filter(id => id !== user.id);
    try { await request(`/school/social/groups/${groupId}`, { method: 'PATCH', body: JSON.stringify({ members }) }); } catch {}
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, members } : g));
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const postData = {
      title: formData.get('title'),
      content: formData.get('content'),
      authorName: user.name,
      groupId: formData.get('groupId') || null,
    };
    try {
      const res = await request('/school/social/posts', { method: 'POST', body: JSON.stringify(postData) });
      setPosts(prev => [res.post || { id: Date.now().toString(), ...postData, authorId: user.id, createdAt: new Date().toISOString(), likes: [], comments: [], views: 0 }, ...prev]);
    } catch {}
    setShowCreatePost(false);
    e.target.reset();
  };

  const handleSubmitGroup = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const groupData = {
      name: formData.get('name'),
      description: formData.get('description'),
      visibility: formData.get('visibility'),
    };
    try {
      const res = await request('/school/social/groups', { method: 'POST', body: JSON.stringify(groupData) });
      setGroups(prev => [...prev, res.group || { id: Date.now().toString(), ...groupData, createdBy: user.id, createdAt: new Date().toISOString(), members: [user.id] }]);
    } catch {}
    setShowCreateGroup(false);
    e.target.reset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users size={28} className="text-gray-600" />
            Community & Social Hub
          </h1>
          <p className="text-sm text-gray-600 mt-1">Connect, share, and collaborate</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowCreatePost(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Create Post
          </button>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Users2 size={18} />
            Create Group
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nova-card p-4">
        <div className="flex flex-wrap gap-2">
          {['feed', 'my_groups', 'public_groups'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts or groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {posts
            .filter(post => !post.groupId || userGroups.some(g => g.id === post.groupId))
            .filter(post => 
              search === '' || 
              post.title.toLowerCase().includes(search.toLowerCase()) ||
              post.content.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(post => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
                onLike={handleLike}
                onDelete={(id) => {
                  request(`/school/social/posts/${id}`, { method: 'DELETE' }).catch(() => {});
                  setPosts(prev => prev.filter(p => p.id !== id));
                }}
                onComment={handleComment}
              />
            ))
          }
        </div>
      )}

      {activeTab === 'my_groups' && (
        <div className="space-y-4">
          {userGroups
            .filter(group => 
              search === '' || 
              group.name.toLowerCase().includes(search.toLowerCase()) ||
              group.description.toLowerCase().includes(search.toLowerCase())
            )
            .map(group => (
              <GroupCard
                key={group.id}
                group={group}
                user={user}
                onJoin={handleJoinGroup}
                onLeave={handleLeaveGroup}
              />
            ))
          }
        </div>
      )}

      {activeTab === 'public_groups' && (
        <div className="space-y-4">
          {publicGroups
            .filter(group => 
              search === '' || 
              group.name.toLowerCase().includes(search.toLowerCase()) ||
              group.description.toLowerCase().includes(search.toLowerCase())
            )
            .map(group => (
              <GroupCard
                key={group.id}
                group={group}
                user={user}
                onJoin={handleJoinGroup}
                onLeave={handleLeaveGroup}
              />
            ))
          }
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreatePost(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="nova-card p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Create New Post</h2>
            
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  name="title"
                  required
                  className="input-field"
                  placeholder="What's on your mind?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  name="content"
                  required
                  rows={6}
                  className="input-field resize-none"
                  placeholder="Share your thoughts, questions, or announcements..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Post to Group (Optional)</label>
                <select name="groupId" className="input-field">
                  <option value="">Public Feed</option>
                  {userGroups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateGroup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="nova-card p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            
            <form onSubmit={handleSubmitGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  name="name"
                  required
                  className="input-field"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Describe your group..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <select name="visibility" required className="input-field">
                  <option value="public">Public (Anyone can join)</option>
                  <option value="private">Private (Invite only)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Create Group
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};