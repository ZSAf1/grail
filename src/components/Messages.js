import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Messages({ listing }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    fetchConversations(user.id);
  };

  const openListingConvo = async () => {
    const fakeConvo = {
      sender_id: currentUser.id,
      receiver_id: listing.user_id,
      listing_id: listing.id,
      sender_username: currentUser.email.split('@')[0],
      content: `re: ${listing.name}`,
    };
    setSelectedConvo(fakeConvo);
    fetchMessages(fakeConvo);
  };

  // eslint-disable-next-line
  useEffect(() => {
    fetchUser();
  }, []);

  // eslint-disable-next-line
  useEffect(() => {
    if (listing && currentUser) {
      openListingConvo();
    }
  }, [listing, currentUser]);

  const fetchConversations = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) {
      console.log('error', error);
    } else {
      const seen = new Set();
      const unique = data.filter(msg => {
        const key = [msg.sender_id, msg.receiver_id, msg.listing_id].sort().join('-');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setConversations(unique);
    }
    setLoading(false);
  };

  const fetchMessages = async (convo) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('listing_id', convo.listing_id)
      .order('created_at', { ascending: true });
    if (error) {
      console.log('error', error);
    } else {
      setMessages(data);
    }
  };

  const handleSend = async () => {
    if (newMessage.trim() === '') return;
    const otherUserId = selectedConvo.sender_id === currentUser.id
      ? selectedConvo.receiver_id
      : selectedConvo.sender_id;
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: currentUser.id,
        receiver_id: otherUserId,
        listing_id: selectedConvo.listing_id,
        content: newMessage,
        sender_username: currentUser.email.split('@')[0],
      }])
      .select();
    if (error) {
      console.log('error', error);
    } else {
      setMessages([...messages, data[0]]);
      setNewMessage('');
    }
  };

  if (selectedConvo) {
    const otherUsername = selectedConvo.sender_id === currentUser?.id
      ? selectedConvo.receiver_id
      : selectedConvo.sender_username;

    return (
      <div className="messages">
        <div className="detail-back" onClick={() => setSelectedConvo(null)}>
          ← back to messages
        </div>
        <div className="convo-header">
          <div className="avatar">{otherUsername.slice(0, 2).toUpperCase()}</div>
          <div className="username" style={{ marginLeft: '10px' }}>{otherUsername}</div>
        </div>
        <div className="messages-list">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-bubble ${msg.sender_id === currentUser?.id ? 'sent' : 'received'}`}
            >
              {msg.content}
            </div>
          ))}
        </div>
        <div className="message-input-row">
          <input
            className="form-input"
            type="text"
            placeholder="type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <div className="pbtn solid" style={{ flex: 0, padding: '10px 16px', marginLeft: '8px' }} onClick={handleSend}>
            send
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages">
      <div className="closet-title">messages</div>
      {loading ? (
        <div className="loading">loading messages...</div>
      ) : conversations.length === 0 ? (
        <div className="loading">no messages yet. message a seller to get started.</div>
      ) : (
        conversations.map((convo, index) => (
          <div
            className="convo-item"
            key={index}
            onClick={() => {
              setSelectedConvo(convo);
              fetchMessages(convo);
            }}
          >
            <div className="avatar">{convo.sender_username.slice(0, 2).toUpperCase()}</div>
            <div style={{ marginLeft: '12px' }}>
              <div className="username">{convo.sender_username}</div>
              <div className="occasion">{convo.content}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Messages;