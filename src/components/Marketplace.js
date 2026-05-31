import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Marketplace({ onMessageSeller }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newListing, setNewListing] = useState({
    brand: '',
    name: '',
    price: '',
    size: '',
    condition: 'excellent',
    category: 'tops',
    image_url: '',
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*');
    if (error) {
      console.log('error', error);
    } else {
      setListings(data);
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
    setNewListing({ ...newListing, image_url: data.secure_url });
    setUploading(false);
  };

  const handleList = async () => {
    if (newListing.brand.trim() === '' || newListing.price.trim() === '') return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('listings')
      .insert([{ ...newListing, user_id: user.id, seller: user.email.split('@')[0] }])
      .select();
    if (error) {
      console.log('error', error);
    } else {
      setListings([...listings, data[0]]);
      setNewListing({
        brand: '',
        name: '',
        price: '',
        size: '',
        condition: 'excellent',
        category: 'tops',
        image_url: '',
      });
      setShowForm(false);
    }
  };

  const conditionColor = {
    excellent: { bg: '#EAF3DE', color: '#3B6D11' },
    good: { bg: '#E6F1FB', color: '#185FA5' },
    fair: { bg: '#FAEEDA', color: '#854F0B' },
  };

  if (selectedItem !== null) {
    const item = listings[selectedItem];
    const cond = conditionColor[item.condition] || conditionColor.good;
    return (
      <div className="marketplace">
        <div className="detail-back" onClick={() => setSelectedItem(null)}>
          ← back to shop
        </div>
        <div className="detail-img">
          {item.image_url
            ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
            : '👕'
          }
        </div>
        <div className="detail-info">
          <div className="detail-brand">{item.name}</div>
          <div className="detail-category">{item.brand}</div>
          <div className="detail-row">
            <span className="detail-key">price</span>
            <span className="detail-val">{item.price}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">size</span>
            <span className="detail-val">{item.size}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">condition</span>
            <span className="detail-val" style={{ background: cond.bg, color: cond.color, padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>
              {item.condition}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-key">seller</span>
            <span className="detail-val">@{item.seller}</span>
          </div>
        </div>
        <div className="detail-actions">
          <div className="pbtn" onClick={() => onMessageSeller(item)}>message seller</div>
          <div className="pbtn solid">buy now</div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="market-title">shop</div>
        <div className="pbtn solid" style={{ flex: 0, padding: '8px 14px', fontSize: '11px' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ cancel' : '+ sell'}
        </div>
      </div>

      {showForm && (
        <div className="add-form" style={{ marginBottom: '20px' }}>
          <input
            className="form-input"
            type="text"
            placeholder="brand"
            value={newListing.brand}
            onChange={(e) => setNewListing({ ...newListing, brand: e.target.value })}
          />
          <input
            className="form-input"
            type="text"
            placeholder="item name"
            value={newListing.name}
            onChange={(e) => setNewListing({ ...newListing, name: e.target.value })}
          />
          <input
            className="form-input"
            type="text"
            placeholder="price e.g. £25"
            value={newListing.price}
            onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
          />
          <input
            className="form-input"
            type="text"
            placeholder="size"
            value={newListing.size}
            onChange={(e) => setNewListing({ ...newListing, size: e.target.value })}
          />
          <select
            className="form-select"
            value={newListing.condition}
            onChange={(e) => setNewListing({ ...newListing, condition: e.target.value })}
          >
            <option value="excellent">excellent</option>
            <option value="good">good</option>
            <option value="fair">fair</option>
          </select>
          <select
            className="form-select"
            value={newListing.category}
            onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
          >
            <option value="tops">tops</option>
            <option value="bottoms">bottoms</option>
            <option value="shoes">shoes</option>
            <option value="outerwear">outerwear</option>
            <option value="bags">bags</option>
          </select>
          <div className="upload-area">
            {newListing.image_url
              ? <img src={newListing.image_url} alt="preview" style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }} />
              : null
            }
            <label className="upload-btn">
              {uploading ? 'uploading...' : newListing.image_url ? '✓ photo added' : '+ add photo'}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>
          <div className="form-btns">
            <div className="pbtn" onClick={() => setShowForm(false)}>cancel</div>
            <div className="pbtn solid" onClick={handleList}>list item</div>
          </div>
        </div>
      )}

      <div className="market-search">
        <span className="search-icon">⊹</span>
        <span className="search-placeholder">search all items...</span>
      </div>

      {loading ? (
        <div className="loading">loading listings...</div>
      ) : (
        <div className="market-grid">
          {listings.map((item, index) => (
            <div className="market-item" key={item.id} onClick={() => setSelectedItem(index)}>
              <div className="market-img">
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '👕'
                }
              </div>
              <div className="market-info">
                <div className="market-brand">{item.brand}</div>
                <div className="market-name">{item.name}</div>
                <div className="market-price">{item.price}</div>
                <div className="market-seller">by {item.seller} · {item.size}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: '120px' }}></div>
    </div>
  );
}

export default Marketplace;