import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { supabase } from '../supabase/client';
    import { Lock, Mail } from 'lucide-react';

    const AdminLogin: React.FC = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState('');
      const navigate = useNavigate();

      const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError('Échec de connexion : email ou mot de passe incorrect.');
          return;
        }

        const userId = authData?.user?.id;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();


        if (profileError || profile?.role !== 'admin') {
          setError("Accès refusé : vous n'êtes pas administrateur.");
          return;
        }

        navigate('/admin/dashboard');
      };

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-site-primary to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-800">Administration</h1>
              <p className="text-zinc-600">Au Matin Vert</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-site-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Se connecter
              </button>
              {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            </form>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-zinc-600 hover:text-site-primary"
              >
                Retour au site
              </a>
            </div>
          </div>
        </div>
      );
    };

    export default AdminLogin;