import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Key, Shield } from "lucide-react";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

const changePasswordSchema = z.object({
  currentPassword.string().min(1, "Current password is required"),
  newPassword.string().min(6, "New password must be at least 6 characters"),
  confirmPassword.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path"confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function AdminAccount() {
  const { toast } = useToast();

  const form = useForm({
    resolverodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFnsync (datahangePasswordForm) => {
      return apiRequest("POST", "/api/admin/change-password", {
        currentPasswordata.currentPassword,
        newPasswordata.newPassword,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      form.reset();
    },
    onError: (errorny) => {
      toast({
        title: "Error",
        descriptionrror.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (datahangePasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Account Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your admin account security
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        
          
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Change Password</CardTitle>
            </div>
            
              Update your admin password to keep your account secure
            </CardDescription>
          </CardHeader>
          
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    
                      Current Password</FormLabel>
                      
                        <Input
                          type="password"
                          placeholder="Enter current password"
                          {...field}
                          data-testid="input-current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    
                      New Password</FormLabel>
                      
                        <Input
                          type="password"
                          placeholder="Enter new password (min 6 characters)"
                          {...field}
                          data-testid="input-new-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    
                      Confirm New Password</FormLabel>
                      
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          {...field}
                          data-testid="input-confirm-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  data-testid="button-change-password"
                >
                  <Key className="w-4 h-4 mr-2" />
                  {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        
          
            Security Information</CardTitle>
            
              Important notes about your account security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Use a strong password with at least 6 characters</p>
            <p>• Avoid using common words or personal information</p>
            <p>• Keep your password secure and don't share it</p>
            <p>• Change your password regularly for better security</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
