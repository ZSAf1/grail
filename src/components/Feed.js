import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newPost, setNewPost] = useState({
    occasion: '',
    caption: '',
    image_url: '',
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.log('error', error);
    } else {
      setPosts(data);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'grail_uploads');
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await response.json();
    setNewPost({ ...newPost, image_url: data.secure_url });
    setUploading(false);
  };

  const handlePost = async () => {
    if (newPost.caption.trim() === '') return;
    const { data: { user } } = await supabase.auth.getUser();
    const username = user.email.split('@')[0];
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        ...newPost,
        user_id: user.id,
        username,
        likes: 0,
      }])
      .select();
    if (error) {
      console.log('error', error);
    } else {
      setPosts([data[0], ...posts]);
      setNewPost({ occasion: '', caption: '', image_url: '' });
      setShowForm(false);
    }
  };

  const handleLike = async (post) => {
    const newLikes = post.liked ? post.likes - 1 : post.likes + 1;
    setPosts(posts.map(p =>
      p.id === post.id ? { ...p, likes: newLikes, liked: !p.liked } : p
    ));
    await supabase
      .from('posts')
      .update({ likes: newLikes })
      .eq('id', post.id);
  };

  return (
    <div className="feed">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 16px' }}>
        <div className="feed-label" style={{ padding: 0 }}>your feed</div>
        <div className="pbtn solid" style={{ flex: 0, padding: '6px 14px', fontSize: '11px' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ cancel' : '+ post'}
        </div>
      </div>

      {showForm && (
        <div className="add-form" style={{ margin: '0 20px 20px' }}>
          <input
            className="form-input"
            type="text"
            placeholder="occasion e.g. office · monday"
            value={newPost.occasion}
            onChange={(e) => setNewPost({ ...newPost, occasion: e.target.value })}
          />
          <input
            className="form-input"
            type="text"
            placeholder="caption"
            value={newPost.caption}
            onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
          />
          <div className="upload-area">
            {newPost.image_url
              ? <img src={newPost.image_url} alt="preview" style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }} />
              : null
            }
            <label className="upload-btn">
              {uploading ? 'uploading...' : newPost.image_url ? '✓ photo added' : '+ add outfit photo'}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>
          <div className="form-btns">
            <div className="pbtn" onClick={() => setShowForm(false)}>cancel</div>
            <div className="pbtn solid" onClick={handlePost}>post</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">loading feed...</div>
      ) : posts.length === 0 ? (
        <div className="loading">no posts yet. be the first to post an outfit.</div>
      ) : (
        posts.map(post => (
          <div className="outfit-card" key={post.id}>
            <div className="card-user">
              <div className="avatar">{post.username.slice(0, 2).toUpperCase()}</div>
              <div className="card-user-info">
                <div className="username">{post.username}</div>
                <div className="occasion">{post.occasion}</div>
              </div>
            </div>
            {post.image_url && (
              <div style={{ width: '100%', aspectRatio: '4/5', overflow: 'hidden' }}>
                <img src={post.image_url} alt="outfit" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div className="card-details">
              <div className="card-caption">{post.caption}</div>
              <div className="card-actions">
                <button
                  className={post.liked ? 'liked' : ''}
                  onClick={() => handleLike(post)}
                >
                  {post.liked ? '♥' : '♡'} {post.likes}
                </button>
                <button className="save-btn">⊹ save</button>
              </div>
            </div>
          </div>
        ))
      )}

      <div style={{ marginBottom: '120px' }}></div>
    </div>
  );
}

export default Feed;