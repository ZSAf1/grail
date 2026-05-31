import React, { useState } from 'react';
import { supabase } from '../supabase';

function Auth() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (email.trim() === '' || password.trim() === '') return;
    setLoading(true);
    setMessage('');

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Check your email to confirm your account.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth">
      <div className="auth-logo">Grail</div>
      <div className="auth-title">{mode === 'login' ? 'welcome back' : 'create account'}</div>

      <div className="add-form">
        <input
          className="form-input"
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="form-input"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {message && <div className="auth-message">{message}</div>}
        <div className="pbtn solid" onClick={handleSubmit}>
          {loading ? 'please wait...' : mode === 'login' ? 'log in' : 'sign up'}
        </div>
      </div>

      <div className="auth-switch">
        {mode === 'login' ? "don't have an account? " : 'already have an account? '}
        <span onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'sign up' : 'log in'}
        </span>
      </div>
    </div>
  );
}

export default Auth;