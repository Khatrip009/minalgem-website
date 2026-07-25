import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setLoading(true);
      // The register function from AuthContext calls supabase.auth.signUp
      await register({ full_name: name.trim(), email: email.trim(), password });
      alert('Registration successful! Please check your email to confirm your account.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white border border-gold-200 shadow-sm p-8 md:p-10 rounded-sm">
        <div className="text-center mb-8">
          <img
            src="/logo_minalgems.png"
            alt="Minalgems"
            className="h-12 mx-auto mb-4"
          />
          <h2 className="font-serif text-3xl text-gold-700 tracking-wide">Create Account</h2>
          <p className="text-sm text-charcoal mt-2">Join the Minalgems family</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gold-600 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gold-300 px-4 py-3 text-charcoal placeholder-gray-400 text-sm focus:outline-none focus:border-gold-500"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gold-600 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gold-300 px-4 py-3 text-charcoal placeholder-gray-400 text-sm focus:outline-none focus:border-gold-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gold-600 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gold-300 px-4 py-3 text-charcoal placeholder-gray-400 text-sm focus:outline-none focus:border-gold-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gold-600 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-gold-300 px-4 py-3 text-charcoal placeholder-gray-400 text-sm focus:outline-none focus:border-gold-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold-500 text-white uppercase tracking-widest text-sm font-medium hover:bg-gold-600 transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-charcoal">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-600 hover:text-gold-700 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}