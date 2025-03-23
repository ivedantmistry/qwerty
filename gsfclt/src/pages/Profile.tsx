
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserCircle, Mail, Phone, AtSign, Edit2, BriefcaseBusiness, Save } from "lucide-react";
import Header from '../components/Header';
import { getCurrentUser, UserRole } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const { toast } = useToast();
  const [user, setUser] = useState(getCurrentUser());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    contact: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        employeeId: user.employeeId,
        contact: user.contact
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (user) {
      const updatedUser = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        employeeId: formData.employeeId,
        contact: formData.contact
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully."
      });
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch(role) {
      case 'lab_assistant':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'supervisor':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'manager':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch(role) {
      case 'lab_assistant':
        return 'Lab Assistant';
      case 'supervisor':
        return 'Supervisor';
      case 'manager':
        return 'Manager';
      default:
        return role;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No user data found. Please sign in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-chemical-50/50 to-white dark:from-chemical-900 dark:to-chemical-800 dark:text-white">
      <Header />
      
      <main className="page-container animate-fade-in py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 flex items-center">
            <UserCircle className="h-12 w-12 text-accent1 mr-4" />
            <div>
              <h1 className="text-3xl font-display font-medium text-chemical-900 dark:text-white">
                My Profile
              </h1>
              <div className="flex items-center mt-1">
                <p className="text-chemical-600 dark:text-chemical-300">
                  View and edit your profile information
                </p>
                <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            </div>
            
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AtSign className="h-5 w-5 mr-2 text-accent1" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="flex items-center">
                    <BriefcaseBusiness className="h-4 w-4 mr-1 text-muted-foreground" />
                    Employee ID
                  </Label>
                  <Input
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact" className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                    Contact Number
                  </Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              {isEditing && (
                <div className="pt-4">
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
