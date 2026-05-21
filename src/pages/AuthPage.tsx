import React, { useState } from 'react';
import { AudioWaveform, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { signIn, signUp, signInWithGoogle } from '../firebase/firebaseConfig';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setError('');
    setDisplayName('');
    setEmail('');
    setPassword('');
    setConfirm('');
  };

  const switchMode = (m: AuthMode) => {
    resetForm();
    setMode(m);
  };

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (mode === 'signup') {
      if (!displayName.trim()) { setError('Please enter your name.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirm) { setError('Passwords do not match.'); return; }
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password, displayName.trim());
      } else {
        await signIn(email, password);
      }
    } catch (e: any) {
      const msg = e?.code || e?.message || 'Something went wrong.';
      if (msg.includes('email-already-in-use')) setError('An account with this email already exists.');
      else if (msg.includes('user-not-found') || msg.includes('invalid-credential')) setError('Invalid email or password.');
      else if (msg.includes('wrong-password')) setError('Incorrect password.');
      else if (msg.includes('invalid-email')) setError('Please enter a valid email address.');
      else if (msg.includes('demo-key') || msg.includes('api-key')) setError('Firebase not configured yet. Add your .env keys to enable auth.');
      else setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      const msg = e?.code || e?.message || '';
      if (msg.includes('popup-closed')) setError('Sign-in popup was closed.');
      else if (msg.includes('demo-key') || msg.includes('api-key')) setError('Firebase not configured yet. Add your .env keys to enable auth.');
      else setError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="auth-page">
      {/* Left panel — branding */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon"><AudioWaveform size={28} /></div>
          <span className="auth-brand-name">Harmonia</span>
        </div>
        <div className="auth-hero">
          <h1 className="auth-hero-title">
            Compose music<br />
            <span className="auth-hero-accent">with AI.</span>
          </h1>
          <p className="auth-hero-sub">
            Generate original music across styles and moods,
            split stems, and store your compositions in the cloud — all in one place.
          </p>
        </div>
        <div className="auth-features">
          {[
            { emoji: '🎵', label: 'AI Music Generation' },
            { emoji: '🎹', label: '4 Styles & 4 Moods' },
            { emoji: '✂️', label: 'Stem Splitter' },
            { emoji: '☁️', label: 'Cloud Storage' },
          ].map(f => (
            <div key={f.label} className="auth-feature-pill">
              <span>{f.emoji}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
        <div className="auth-visual">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="auth-bar"
              style={{
                height: `${30 + Math.abs(Math.sin(i * 0.9)) * 60}%`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right">
        <div className="auth-card">
          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              Create Account
            </button>
            <div className={`auth-tab-indicator ${mode === 'signup' ? 'right' : 'left'}`} />
          </div>

          <div className="auth-form">
            <h2 className="auth-form-title">
              {mode === 'login' ? 'Welcome back' : 'Join Harmonia'}
            </h2>
            <p className="auth-form-sub">
              {mode === 'login'
                ? 'Sign in to access your music library'
                : 'Create your free account to get started'}
            </p>

            {/* Google button */}
            <button
              className="google-btn"
              onClick={handleGoogle}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <div className="btn-spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              )}
              <span>{googleLoading ? 'Signing in…' : 'Continue with Google'}</span>
            </button>

            <div className="auth-divider">
              <span>or continue with email</span>
            </div>

            {/* Name field (signup only) */}
            {mode === 'signup' && (
              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <div className="auth-input-wrap">
                  <User size={16} className="auth-input-icon" />
                  <input
                    className="auth-input"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    onKeyDown={handleKey}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKey}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
                <button
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  type="button"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm password (signup only) */}
            {mode === 'signup' && (
              <div className="auth-field">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-wrap">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    className="auth-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onKeyDown={handleKey}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="auth-error">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              className="auth-submit-btn"
              onClick={handleSubmit}
              disabled={loading || googleLoading}
            >
              {loading ? (
                <div className="btn-spinner" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="auth-switch">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                className="auth-switch-btn"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
