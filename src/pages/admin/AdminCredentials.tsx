
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import { Edit, Plus, Trash } from 'lucide-react';

import { getAllUsers, updateUser, createUser, deleteUser } from '@/lib/storage';
import { User, UserRole } from '@/lib/types';

export default function AdminCredentials() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<UserRole | 'all'>('all');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('leader');
  
  // Load users
  useEffect(() => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  }, []);
  
  // Filter users
  useEffect(() => {
    let filtered = users;
    
    if (filter !== 'all') {
      filtered = filtered.filter(user => user.role === filter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  }, [users, filter, searchTerm]);
  
  const handleAddUser = () => {
    setDialogMode('add');
    setEditName('');
    setEditEmail('');
    setEditPassword('');
    setEditRole('leader');
    setSelectedUser(null);
    setIsDialogOpen(true);
  };
  
  const handleEditUser = (user: User) => {
    setDialogMode('edit');
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword(user.password);
    setEditRole(user.role);
    setSelectedUser(user);
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (!selectedUser) return;
    
    try {
      deleteUser(selectedUser.id);
      
      toast.success("User deleted successfully", {
        description: `User ${selectedUser.name} has been deleted.`
      });
      
      // Update state
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };
  
  const handleSaveUser = () => {
    // Validation
    if (!editName.trim() || !editEmail.trim() || !editPassword || !editRole) {
      toast.error("Please fill all required fields");
      return;
    }
    
    try {
      if (dialogMode === 'add') {
        // Create new user
        const newUser = createUser({
          name: editName,
          email: editEmail,
          password: editPassword,
          role: editRole
        });
        
        // Update state
        setUsers(prev => [...prev, newUser]);
        toast.success("User created successfully");
      } else if (dialogMode === 'edit' && selectedUser) {
        // Update existing user
        const updatedUser = {
          ...selectedUser,
          name: editName,
          email: editEmail,
          password: editPassword,
          role: editRole
        };
        
        updateUser(updatedUser);
        
        // Update state
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        toast.success("User updated successfully");
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
    }
  };
  
  const getRoleBadgeClass = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'leader':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'checker':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'owner':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Credentials</h1>
        <p className="text-muted-foreground">
          Manage user accounts, permissions, and login credentials.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80"
          />
          
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as UserRole | 'all')}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="leader">Leader</SelectItem>
              <SelectItem value="checker">Checker</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handleAddUser} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage users and their access permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found.
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                          {user.password}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(user)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'add' ? 'Add New User' : 'Edit User'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'add'
                ? 'Create a new user account with credentials and permissions.'
                : 'Update user information, password, or role.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter user's name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Enter user's email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="text" // Showing password in plain text for admin use
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editRole}
                onValueChange={(value) => setEditRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="leader">Leader</SelectItem>
                  <SelectItem value="checker">Checker</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              {dialogMode === 'add' ? 'Create User' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user "{selectedUser?.name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
