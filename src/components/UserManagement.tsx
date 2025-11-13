import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, UserPlus } from 'lucide-react';

type AppRole = 'reader' | 'registered_reader' | 'paid_reader' | 'reporter' | 'admin';

interface UserWithRoles {
  id: string;
  email: string;
  roles: AppRole[];
}

export function UserManagement() {
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<UserWithRoles[]>([]);

  // Fetch all users and their roles
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (error) throw error;
      return data;
    }
  });

  // Get unique users from roles and fetch their emails
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userRoles) return;

      // Get unique user IDs
      const userIds = [...new Set(userRoles.map(ur => ur.user_id))];
      
      // Fetch user data
      const usersData = await Promise.all(
        userIds.map(async (userId) => {
          const { data } = await supabase.auth.admin.getUserById(userId);
          const userRolesData = userRoles
            .filter(ur => ur.user_id === userId)
            .map(ur => ur.role as AppRole);
          
          return {
            id: userId,
            email: data?.user?.email || 'Unknown',
            roles: userRolesData
          };
        })
      );

      setUsers(usersData);
    };

    fetchUsers();
  }, [userRoles]);

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Role added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add role: ${error.message}`);
    }
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Role removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove role: ${error.message}`);
    }
  });

  const handleAddRole = (userId: string, role: AppRole) => {
    addRoleMutation.mutate({ userId, role });
  };

  const handleRemoveRole = (userId: string, role: AppRole) => {
    removeRoleMutation.mutate({ userId, role });
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'reporter':
        return 'default';
      case 'paid_reader':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user roles and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-2 flex-wrap">
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <Badge key={role} variant={getRoleBadgeVariant(role)}>
                          {role.replace('_', ' ')}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">No roles</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 items-center">
                    <Select
                      onValueChange={(role: AppRole) => handleAddRole(user.id, role)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Add role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reader">Reader</SelectItem>
                        <SelectItem value="registered_reader">Registered Reader</SelectItem>
                        <SelectItem value="paid_reader">Paid Reader</SelectItem>
                        <SelectItem value="reporter">Reporter</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {user.roles.length > 0 && (
                      <Select
                        onValueChange={(role: AppRole) => handleRemoveRole(user.id, role)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Remove role" />
                        </SelectTrigger>
                        <SelectContent>
                          {user.roles.map((role) => (
                            <SelectItem key={role} value={role}>
                              Remove {role.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
