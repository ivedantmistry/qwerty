
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUsers, addUser, updateUser, deleteUser, User, UserRole, getRoleName } from '@/utils/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { Users, UserPlus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import { DataTable } from "@/components/DataTable";
import { Alert, AlertDescription } from "@/components/ui/alert";

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User & { password: string }>>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    employeeId: '',
    contact: '',
    role: 'lab_assistant',
    department: 'Quality Control',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    // Load users
    setUsers(getUsers());
  }, []);

  const handleAddUser = () => {
    setIsSubmitting(true);
    setFormError('');
    
    // Validate required fields
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password || !newUser.employeeId) {
      setFormError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setFormError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }
    
    // Check if email already exists
    if (users.some(user => user.email === newUser.email)) {
      setFormError('A user with this email address already exists');
      setIsSubmitting(false);
      return;
    }

    try {
      // Add user to the system
      const addedUser = addUser({
        firstName: newUser.firstName!,
        lastName: newUser.lastName!,
        email: newUser.email!,
        password: newUser.password!,
        employeeId: newUser.employeeId!,
        contact: newUser.contact || '',
        role: newUser.role as UserRole,
        department: newUser.department,
        status: newUser.status as 'active' | 'inactive',
        joinDate: newUser.joinDate
      });
      
      setUsers(getUsers());
      
      toast({
        title: "User Added",
        description: `${addedUser.firstName} ${addedUser.lastName} has been added successfully.`,
      });
      
      setOpenAddDialog(false);
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        employeeId: '',
        contact: '',
        role: 'lab_assistant',
        department: 'Quality Control',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error adding user:", error);
      setFormError('An error occurred while adding the user');
    }
    
    setIsSubmitting(false);
  };
  
  const handleEditUser = () => {
    setIsSubmitting(true);
    setFormError('');
    
    if (!currentUser) {
      setIsSubmitting(false);
      return;
    }
    
    // Validate required fields
    if (!currentUser.firstName || !currentUser.lastName || !currentUser.email || !currentUser.employeeId) {
      setFormError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentUser.email)) {
      setFormError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }
    
    // Check if email already exists (but ignore the current user)
    if (users.some(user => user.email === currentUser.email && user.id !== currentUser.id)) {
      setFormError('Another user with this email address already exists');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Update user
      const updatedUser = updateUser(currentUser);
      
      if (updatedUser) {
        setUsers(getUsers());
        
        toast({
          title: "User Updated",
          description: `${updatedUser.firstName} ${updatedUser.lastName} has been updated successfully.`,
        });
        
        setOpenEditDialog(false);
      } else {
        setFormError('User not found');
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setFormError('An error occurred while updating the user');
    }
    
    setIsSubmitting(false);
  };
  
  const handleDeleteUser = () => {
    if (!currentUser) return;
    
    try {
      const result = deleteUser(currentUser.id);
      
      if (result) {
        setUsers(getUsers());
        
        toast({
          title: "User Deleted",
          description: `${currentUser.firstName} ${currentUser.lastName} has been deleted successfully.`,
        });
        
        setOpenDeleteDialog(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User not found",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deleting the user",
      });
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "employeeId",
      header: "Employee ID",
    },
    {
      accessorFn: row => `${row.firstName} ${row.lastName}`,
      id: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as UserRole;
        return getRoleName(role);
      },
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status === 'active' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setCurrentUser(user);
                setOpenEditDialog(true);
              }}
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setCurrentUser(user);
                setOpenDeleteDialog(true);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-chemical-50/50 to-white dark:from-chemical-900 dark:to-chemical-800 dark:text-white">
      <Header />
      
      <main className="page-container animate-fade-in">
        <div className="mb-8 flex items-center">
          <Users className="h-8 w-8 mr-3 text-accent1" />
          <div>
            <h2 className="text-3xl font-display font-medium text-chemical-900 dark:text-white">
              User Management
            </h2>
            <p className="text-chemical-600 dark:text-chemical-300">
              Manage user accounts and access permissions
            </p>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">System Users</CardTitle>
              <CardDescription>
                View and manage users with access to the ChemView Portal
              </CardDescription>
            </div>
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new user
                  </DialogDescription>
                </DialogHeader>
                
                {formError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID *</Label>
                      <Input
                        id="employeeId"
                        value={newUser.employeeId}
                        onChange={(e) => setNewUser({...newUser, employeeId: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact Number</Label>
                      <Input
                        id="contact"
                        value={newUser.contact}
                        onChange={(e) => setNewUser({...newUser, contact: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select 
                        value={newUser.role}
                        onValueChange={(value: UserRole) => setNewUser({...newUser, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lab_assistant">Lab Assistant</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={newUser.department}
                        onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="joinDate">Join Date</Label>
                      <Input
                        id="joinDate"
                        type="date"
                        value={newUser.joinDate}
                        onChange={(e) => setNewUser({...newUser, joinDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={newUser.status}
                        onValueChange={(value: 'active' | 'inactive') => setNewUser({...newUser, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddUser} disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add User"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={users}
              searchPlaceholder="Search users..."
              searchColumn="name"
            />
          </CardContent>
        </Card>
      </main>
      
      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Modify the user details
            </DialogDescription>
          </DialogHeader>
          
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name *</Label>
                <Input
                  id="edit-firstName"
                  value={currentUser?.firstName || ''}
                  onChange={(e) => setCurrentUser(curr => curr ? {...curr, firstName: e.target.value} : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name *</Label>
                <Input
                  id="edit-lastName"
                  value={currentUser?.lastName || ''}
                  onChange={(e) => setCurrentUser(curr => curr ? {...curr, lastName: e.target.value} : null)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={currentUser?.email || ''}
                onChange={(e) => setCurrentUser(curr => curr ? {...curr, email: e.target.value} : null)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-employeeId">Employee ID *</Label>
                <Input
                  id="edit-employeeId"
                  value={currentUser?.employeeId || ''}
                  onChange={(e) => setCurrentUser(curr => curr ? {...curr, employeeId: e.target.value} : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact">Contact Number</Label>
                <Input
                  id="edit-contact"
                  value={currentUser?.contact || ''}
                  onChange={(e) => setCurrentUser(curr => curr ? {...curr, contact: e.target.value} : null)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select 
                  value={currentUser?.role || ''}
                  onValueChange={(value: UserRole) => setCurrentUser(curr => curr ? {...curr, role: value} : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab_assistant">Lab Assistant</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={currentUser?.department || ''}
                  onChange={(e) => setCurrentUser(curr => curr ? {...curr, department: e.target.value} : null)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-joinDate">Join Date</Label>
                <Input
                  id="edit-joinDate"
                  type="date"
                  value={currentUser?.joinDate || ''}
                  onChange={(e) => setCurrentUser(curr => curr ? {...curr, joinDate: e.target.value} : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={currentUser?.status || ''}
                  onValueChange={(value: 'active' | 'inactive') => setCurrentUser(curr => curr ? {...curr, status: value} : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditUser} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user "{currentUser?.firstName} {currentUser?.lastName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
