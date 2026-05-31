import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Feed from './components/Feed';
import Closet from './components/Closet';
import Marketplace from './components/Marketplace';
import Scanner from './components/Scanner';
import Profile from './components/Profile';
import Messages from './components/Messages';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [activeScreen, setActiveScreen] = useState('feed');
  const [session, setSession] = useState(null);
  const [messagingListing, setMessagingListing] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const handleMessageSeller = (listing) => {
    setMessagingListing(listing);
    setActiveScreen('messages');
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="app">
      <div className="nav-top">
        <div className="nav-logo">Grail</div>
        <div
          className={`nav-top-icon ${activeScreen === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveScreen('messages')}
        >
          ✉
        </div>
      </div>

      <div className="screen-content">
        {activeScreen === 'feed' && <Feed />}
        {activeScreen === 'closet' && <Closet />}
        {activeScreen === 'marketplace' && <Marketplace onMessageSeller={handleMessageSeller} />}
        {activeScreen === 'scanner' && <Scanner />}
        {activeScreen === 'messages' && <Messages listing={messagingListing} />}
        {activeScreen === 'profile' && <Profile />}
      </div>

      <div className="bottom-nav">
        <div className={`nav-item ${activeScreen === 'feed' ? 'active' : ''}`} onClick={() => setActiveScreen('feed')}>
          <span>feed</span>
        </div>
        <div className={`nav-item ${activeScreen === 'closet' ? 'active' : ''}`} onClick={() => setActiveScreen('closet')}>
          <span>closet</span>
        </div>
        <div className={`nav-item ${activeScreen === 'marketplace' ? 'active' : ''}`} onClick={() => setActiveScreen('marketplace')}>
          <span>shop</span>
        </div>
        <div className={`nav-item ${activeScreen === 'scanner' ? 'active' : ''}`} onClick={() => setActiveScreen('scanner')}>
          <span>scan</span>
        </div>
        <div className={`nav-item ${activeScreen === 'profile' ? 'active' : ''}`} onClick={() => setActiveScreen('profile')}>
          <span>me</span>
        </div>
      </div>
    </div>
  );
}

export default App;