import React, { useEffect, useState } from 'react';
    import { supabase } from '../../supabase/client';
    import { toast } from 'react-toastify';
    import { UserCog, Shield, ShieldOff } from 'lucide-react';
    import ExportButton from './ExportButton';
    import ImportButton from './ImportButton';
    import { formatDataForExport } from '../../utils/exportUtils';

    interface UserProfile {
      id: string;
      name: string;
      email: string;
      role: string | null;
      created_at: string | null;
    }

    const AdminUsers: React.FC = () => {
      const [users, setUsers] = useState<UserProfile[]>([]);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        fetchUsers();
      }, []);

      const fetchUsers = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          setUsers(data || []);
        } catch (error) {
          console.error('Error fetching users:', error);
          toast.error('Erreur lors du chargement des utilisateurs');
        } finally {
          setLoading(false);
        }
      };

      const updateUserRole = async (userId: string, newRole: string | null) => {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

          if (error) throw error;

          setUsers(users.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
          ));

          toast.success('Rôle mis à jour avec succès');
        } catch (error) {
          console.error('Error updating user role:', error);
          toast.error('Erreur lors de la mise à jour du rôle');
        }
      };

      const handleImport = async (data: any[]): Promise<boolean> => {
        try {
          const { error } = await supabase
            .from('profiles')
            .insert(data);

          if (error) {
            console.error('Error importing users:', error);
            toast.error('Erreur lors de l\'import des utilisateurs');
            return false;
          }

          await fetchUsers();
          return true;
        } catch (error) {
          console.error('Error importing users:', error);
          toast.error('Erreur lors de l\'import des utilisateurs');
          return false;
        }
      };

      if (loading) {
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-zinc-600">Chargement des utilisateurs...</p>
          </div>
        );
      }

      return (
        <div className="w-full max-w-full overflow-x-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-800">Gestion des Utilisateurs</h2>
            <div className="flex space-x-3">
              <ExportButton 
                data={formatDataForExport.users(users)}
                filename="utilisateurs"
                disabled={loading || users.length === 0}
              />
              <ImportButton 
                type="users"
                onImport={handleImport}
                disabled={loading}
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Date d'inscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <UserCog className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            <ShieldOff className="h-3 w-3 mr-1" />
                            Utilisateur
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={user.role || ''}
                          onChange={(e) => updateUserRole(user.id, e.target.value || null)}
                          className="text-xs border border-zinc-300 rounded px-2 py-1 bg-white"
                        >
                          <option value="">Utilisateur</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500">Aucun utilisateur trouvé.</p>
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Gestion des Rôles</h3>
            <p className="text-blue-700 text-sm">
              Utilisez le menu déroulant pour attribuer ou retirer le rôle d'administrateur aux utilisateurs.
              Les administrateurs ont accès à toutes les fonctionnalités de gestion.
            </p>
          </div>
        </div>
      );
    };

    export default AdminUsers;