import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInviteMember } from "@/hooks/useInviteMember";
import { Loader2 } from "lucide-react";

export function InviteForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
  });

  const { loading, error, success, handleSubmit } = useInviteMember();

  // Name validation: No numbers, first letter capital
  const validateName = (name: string) => {
    if (!name) return "Name is required";
    if (/[0-9]/.test(name)) return "Name cannot contain numbers";
    if (name[0] !== name[0].toUpperCase()) return "First letter should be capital";
    return "";
  };

  // Email validation
  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  // Validate form whenever formData changes
  useEffect(() => {
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    
    setErrors({
      name: nameError,
      email: emailError,
    });

    const isValid = 
      !nameError && 
      !emailError && 
      formData.role !== "";

    setIsFormValid(isValid);
  }, [formData]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
    setFormData({ name: "", email: "", role: "" });
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Processing invitation...</p>
          </div>
        </div>
      )}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Invite Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-500 rounded-md text-sm">
              {success}
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex gap-2">
              <div className="space-y-1.5 w-[60%]">
                <label htmlFor="name" className="text-sm font-medium flex items-center">
                  Full Name <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Auto-capitalize first letter
                    const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                    setFormData({ ...formData, name: capitalized });
                  }}
                  placeholder="Enter team member's name"
                  required
                  className="h-9"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div className="space-y-1.5 w-[40%]">
                <label htmlFor="role" className="text-sm font-medium flex items-center">
                  Role <span className="text-red-500 ml-1">*</span>
                </label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium flex items-center">
                Email Address <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter team member's email"
                required
                className="h-9"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-9" 
              disabled={!isFormValid || loading}
            >
              Send Invitation
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
} 