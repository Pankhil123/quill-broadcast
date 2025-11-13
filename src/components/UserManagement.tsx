import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type AppRole = 'reader' | 'registered_reader' | 'paid_reader' | 'reporter' | 'admin';

interface UserRole {
  user_id: string;
  role: AppRole;
}

export function UserManagement() {
  const queryClient = useQueryClient();

  // Fetch all user roles
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (error) throw error;
      return data as UserRole[];
    }
  });

  // Fetch user emails for all users with roles
  const { data: userEmails } = useQuery({
    queryKey: ['user-emails', userRoles],
    queryFn: async () => {
      if (!userRoles || userRoles.length === 0) return {};
      
      const uniqueUserIds = [...new Set(userRoles.map(ur => ur.user_id))];
      const emailMap: Record<string, string> = {};
      
      // Fetch user data for each user ID
      for (const userId of uniqueUserIds) {
        const { data } = await supabase.auth.admin.getUserById(userId);
        if (data?.user?.email) {
          emailMap[userId] = data.user.email;
        }
      }
      
      return emailMap;
    },
    enabled: !!userRoles && userRoles.length > 0
  });

  // Group roles by user
  const usersByRole = userRoles?.reduce((acc, ur) => {
    if (!acc[ur.user_id]) {
      acc[ur.user_id] = [];
    }
    acc[ur.user_id].push(ur.role);
    return acc;
  }, {} as Record<string, AppRole[]>) || {};

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

  const userIds = Object.keys(usersByRole);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user roles and permissions for all registered users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userIds.length > 0 ? (
              userIds.map((userId) => {
                const roles = usersByRole[userId] || [];
                const email = userEmails?.[userId] || userId;
                return (
                  <TableRow key={userId}>
                    <TableCell className="font-medium">{email}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {roles.length > 0 ? (
                          roles.map((role) => (
                            <Badge key={role} variant={getRoleBadgeVariant(role)}>
                              {role.replace(/_/g, ' ')}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No roles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center flex-wrap">
                        <Select
                          onValueChange={(role: AppRole) => handleAddRole(userId, role)}
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
                        {roles.length > 0 && (
                          <Select
                            onValueChange={(role: AppRole) => handleRemoveRole(userId, role)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Remove role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  Remove {role.replace(/_/g, ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No users with roles yet. Assign roles to users in the database.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
