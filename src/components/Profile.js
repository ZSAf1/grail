import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Profile() {
  const [activeTab, setActiveTab] = useState('outfits');
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    initials: '',
  });
  const [draft, setDraft] = useState({ ...profile });

  const tabs = ['outfits', 'closet', 'selling'];
  const grid = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const username = user.email.split('@')[0];
      const initials = username.slice(0, 2).toUpperCase();
      const profileData = {
        name: username,
        bio: 'welcome to grail ✦',
        initials,
      };
      setProfile(profileData);
      setDraft(profileData);
      fetchItemCount(user.id);
    }
  };

  const fetchItemCount = async (userId) => {
    const { count, error } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (!error) setItemCount(count);
  };

  const handleSave = () => {
    setProfile({ ...draft });
    setEditing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (editing) {
    return (
      <div className="profile">
        <div className="detail-back" onClick={() => setEditing(false)}>
          ← back
        </div>
        <div className="edit-avatar">{profile.initials}</div>
        <div className="add-form">
          <input
            className="form-input"
            type="text"
            placeholder="name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <input
            className="form-input"
            type="text"
            placeholder="bio"
            value={draft.bio}
            onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
          />
          <div className="form-btns">
            <div className="pbtn" onClick={() => setEditing(false)}>cancel</div>
            <div className="pbtn solid" onClick={handleSave}>save</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-top-row">
        <div className="big-avatar">{profile.initials}</div>
        <div className="profile-nums">
          <div className="pnum">
            <div className="pnum-n">{itemCount}</div>
            <div className="pnum-l">items</div>
          </div>
          <div className="pnum">
            <div className="pnum-n">0</div>
            <div className="pnum-l">followers</div>
          </div>
          <div className="pnum">
            <div className="pnum-n">0</div>
            <div className="pnum-l">following</div>
          </div>
        </div>
      </div>

      <div className="profile-name">{profile.name}</div>
      <div className="profile-bio">{profile.bio}</div>

      <div className="profile-btns">
        <div className="pbtn solid" onClick={() => setEditing(true)}>edit profile</div>
        <div className="pbtn">share</div>
        <div className="pbtn" style={{ flex: 0, padding: '9px 14px', color: '#e0355a', borderColor: '#e0355a' }} onClick={handleLogout}>
          logout
        </div>
      </div>

      <div className="profile-tab-row">
        {tabs.map(tab => (
          <div
            key={tab}
            className={`ptab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="pgrid">
        {grid.map((item) => (
          <div className="pgrid-item" key={item}>👕</div>
        ))}
      </div>
    </div>
  );
}

export default Profile;