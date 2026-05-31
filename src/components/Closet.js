import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Closet() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newItem, setNewItem] = useState({ brand: '', category: 'tops', image_url: '' });
  const [items, setItems] = useState([]);

  const filters = ['all', 'tops', 'bottoms', 'shoes', 'outerwear', 'bags'];

  const outfits = [
    { name: 'office look', items: [1, 2, 3, 4] },
    { name: 'weekend', items: [1, 2, 3, 4] },
    { name: 'evening', items: [1, 2, 3, 4] },
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id);
    if (error) {
      console.log('error', error);
    } else {
      setItems(data);
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
    setNewItem({ ...newItem, image_url: data.secure_url });
    setUploading(false);
  };

  const handleAdd = async () => {
    if (newItem.brand.trim() === '') return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('items')
      .insert([{ ...newItem, color: '', size: '', worn: 0, user_id: user.id }])
      .select();
    if (error) {
      console.log('insert error', error);
    } else {
      setItems([...items, data[0]]);
      setNewItem({ brand: '', category: 'tops', image_url: '' });
      setShowForm(false);
    }
  };

  const filtered = activeFilter === 'all'
    ? items
    : items.filter(item => item.category === activeFilter);

  if (selectedItem !== null) {
    const item = items.find(i => i.id === selectedItem);
    return (
      <div className="closet">
        <div className="detail-back" onClick={() => setSelectedItem(null)}>
          ← back to closet
        </div>
        <div className="detail-img">
          {item.image_url
            ? <img src={item.image_url} alt={item.brand} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
            : '👕'
          }
        </div>
        <div className="detail-info">
          <div className="detail-brand">{item.brand}</div>
          <div className="detail-category">{item.category}</div>
          <div className="detail-row">
            <span className="detail-key">colour</span>
            <span className="detail-val">{item.color || '—'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">size</span>
            <span className="detail-val">{item.size || '—'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">times worn</span>
            <span className="detail-val">{item.worn}</span>
          </div>
        </div>
        <div className="detail-actions">
          <div className="pbtn">sell this item</div>
          <div className="pbtn solid">wear today</div>
        </div>
      </div>
    );
  }

  return (
    <div className="closet">
      <div className="closet-title">my closet</div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num">{items.length}</div>
          <div className="stat-label">items</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">18%</div>
          <div className="stat-label">wear rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">£2.4k</div>
          <div className="stat-label">value</div>
        </div>
      </div>

      <div className="filter-row">
        {filters.map(filter => (
          <div
            key={filter}
            className={`chip ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="loading">loading your closet...</div>
      ) : (
        <div className="items-grid">
          {filtered.map((item) => (
            <div className="item-box" key={item.id} onClick={() => setSelectedItem(item.id)}>
              {item.image_url
                ? <img src={item.image_url} alt={item.brand} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                : <div className="item-emoji">👕</div>
              }
              <div className="item-brand">{item.brand}</div>
            </div>
          ))}
        </div>
      )}

      <div className="section-label">saved outfits</div>
      <div className="outfits-row">
        {outfits.map((outfit, index) => (
          <div className="outfit-thumb" key={index}>
            <div className="outfit-thumb-grid">
              {outfit.items.map((item, i) => (
                <div className="outfit-thumb-item" key={i}>👕</div>
              ))}
            </div>
            <div className="outfit-thumb-label">{outfit.name}</div>
          </div>
        ))}
        <div className="outfit-thumb-add">+</div>
      </div>

      {showForm && (
        <div className="add-form">
          <input
            className="form-input"
            type="text"
            placeholder="brand name"
            value={newItem.brand}
            onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
          />
          <select
            className="form-select"
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          >
            {filters.filter(f => f !== 'all').map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <div className="upload-area">
            {newItem.image_url
              ? <img src={newItem.image_url} alt="preview" style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }} />
              : null
            }
            <label className="upload-btn">
              {uploading ? 'uploading...' : newItem.image_url ? '✓ photo added' : '+ add photo'}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>
          <div className="form-btns">
            <div className="pbtn" onClick={() => setShowForm(false)}>cancel</div>
            <div className="pbtn solid" onClick={handleAdd}>add item</div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '120px' }}>
        <div className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ cancel' : '+ add item to closet'}
        </div>
      </div>
    </div>
  );
}

export default Closet;