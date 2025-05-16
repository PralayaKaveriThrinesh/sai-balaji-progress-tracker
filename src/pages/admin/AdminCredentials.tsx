
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  getAllUsers, 
  createUser,
  updateUser,
  deleteUser
} from '@/lib/storage';
import { User } from '@/lib/types';

const AdminCredentials = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form states
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'leader'
  });
  
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  
  useEffect(() => {
    // Fetch all users
    const allUsers = getAllUsers();
    setUsers(allUsers);
    setFilteredUsers(allUsers);
  }, []);
  
  // Filter users based on role and search term
  useEffect(() => {
    let filtered = users;
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        user => user.name.toLowerCase().includes(term) || 
               user.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredUsers(filtered);
  }, [selectedRole, searchTerm, users]);
  
  const handleAddUser = () => {
    // Validate form
    if (!newUserData.name || !newUserData.email || !newUserData.password || !newUserData.role) {
      toast.error("All fields are required");
      return;
    }
    
    if (!newUserData.email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (newUserData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    try {
      // Check if email already exists
      if (users.some(u => u.email === newUserData.email)) {
        toast.error("A user with this email already exists");
        return;
      }
      
      // Create new user
      const createdUser = createUser({
        name: newUserData.name,
        email: newUserData.email,
        password: newUserData.password,
        role: newUserData.role as 'admin' | 'leader' | 'checker' | 'owner'
      });
      
      // Update state
      setUsers([...users, createdUser]);
      
      // Close dialog and reset form
      setShowAddDialog(false);
      setNewUserData({
        name: '',
        email: '',
        password: '',
        role: 'leader'
      });
      
      toast.success("User created successfully");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    }
  };
  
  const handleEditUser = () => {
    if (!selectedUser) return;
    
    // Validate form
    if (!editUserData.name || !editUserData.email || !editUserData.role) {
      toast.error("Name, email and role are required");
      return;
    }
    
    if (!editUserData.email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (editUserData.password && editUserData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    try {
      // Check if email already exists for another user
      if (users.some(u => u.email === editUserData.email && u.id !== selectedUser.id)) {
        toast.error("Another user with this email already exists");
        return;
      }
      
      // Update user
      const updatedUser = updateUser({
        ...selectedUser,
        name: editUserData.name,
        email: editUserData.email,
        role: editUserData.role as 'admin' | 'leader' | 'checker' | 'owner',
        password: editUserData.password || selectedUser.password // Only update if provided
      });
      
      // Update state
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      
      // Close dialog
      setShowEditDialog(false);
      setSelectedUser(null);
      
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };
  
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    try {
      // Delete user
      deleteUser(selectedUser.id);
      
      // Update state
      setUsers(users.filter(u => u.id !== selectedUser.id));
      
      // Close dialog
      setShowDeleteDialog(false);
      setSelectedUser(null);
      
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };
  
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      password: '', // Don't show existing password
      role: user.role
    });
    setShowEditDialog(true);
  };
  
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };
  
  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      'admin': 'Admin',
      'leader': 'Leader',
      'checker': 'Checker',
      'owner': 'Owner'
    };
    
    return roleMap[role] || role;
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">User Credentials</h1>
      <p className="text-muted-foreground mb-8">
        Manage user accounts and access permissions.
      </p>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="w-full md:w-60">
            <Label htmlFor="role-filter" className="mb-1 block">Filter by Role</Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
            >
              <SelectTrigger id="role-filter">
                <SelectValue placeholder="All Roles" />
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
          
          <div className="w-full md:w-60">
            <Label htmlFor="search-users" className="mb-1 block">Search Users</Label>
            <Input
              id="search-users"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-4 md:mt-auto">
          <Button onClick={() => setShowAddDialog(true)}>
            Add New User
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-muted/20">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4 capitalize">{getRoleLabel(user.role)}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => openDeleteDialog(user)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No users found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with appropriate permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Name</Label>
              <Input
                id="new-name"
                placeholder="Full name"
                value={newUserData.name}
                onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-email">Email Address</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="Email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-role">Role</Label>
              <Select
                value={newUserData.role}
                onValueChange={(value) => setNewUserData({...newUserData, role: value})}
              >
                <SelectTrigger id="new-role">
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
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Full name"
                value={editUserData.name}
                onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Email"
                value={editUserData.email}
                onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password (leave blank to keep unchanged)</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="New password"
                value={editUserData.password}
                onChange={(e) => setEditUserData({...editUserData, password: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editUserData.role}
                onValueChange={(value) => setEditUserData({...editUserData, role: value})}
              >
                <SelectTrigger id="edit-role">
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
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div><strong>Name:</strong> {selectedUser.name}</div>
                <div><strong>Email:</strong> {selectedUser.email}</div>
                <div><strong>Role:</strong> {getRoleLabel(selectedUser.role)}</div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCredentials;
