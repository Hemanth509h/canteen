import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Pencil, Trash2, User } from "lucide-react";
import { insertStaffSchema, updateStaffSchema, type Staff, type InsertStaff, type UpdateStaff } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

const roleMap: Record<string, string> = {
  "chef": "Chef",
  "worker": "Worker",
  "serving_boy": "Serving Boy"
};

const roleColors: Record<string, "default" | "secondary" | "destructive"> = {
  chef: "default",
  worker: "secondary",
  serving_boy: "secondary",
};

export default function StaffManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const { toast } = useToast();

  const { data: staffList, isLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const form = useForm<UpdateStaff>({
    resolver: zodResolver(editingStaff ? updateStaffSchema : insertStaffSchema.extend({
      salary: insertStaffSchema.shape.salary.refine((val) => val > 0, {
        message: "Salary must be greater than 0",
      }),
    })),
    defaultValues: {
      name: "",
      role: "chef",
      phone: "",
      experience: "",
      salary: 0,
      imageUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertStaff) => {
      const salaryInRupees = Math.round(data.salary);
      return apiRequest("POST", "/api/staff", { ...data, salary: salaryInRupees });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({ title: "Success", description: "Staff member created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create staff member", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateStaff }) => {
      const updateData = { ...data };
      if (data.salary !== undefined) {
        updateData.salary = Math.round(data.salary);
      }
      return apiRequest("PATCH", `/api/staff/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({ title: "Success", description: "Staff member updated successfully" });
      setIsDialogOpen(false);
      setEditingStaff(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update staff member", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/staff/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({ title: "Success", description: "Staff member deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete staff member", variant: "destructive" });
    },
  });

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    form.reset({
      name: staff.name,
      role: staff.role,
      phone: staff.phone,
      experience: staff.experience,
      salary: staff.salary,
      imageUrl: staff.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: UpdateStaff) => {
    if (editingStaff) {
      updateMutation.mutate({ id: editingStaff.id, data });
    } else {
      createMutation.mutate(data as InsertStaff);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingStaff(null);
    form.reset();
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Staff Management
          </h2>
          <p className="text-muted-foreground">
            Manage your team members and their details
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-staff">
              <Plus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
              </DialogTitle>
              <DialogDescription>
                {editingStaff ? "Update staff member details" : "Add a new team member"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Staff member name" {...field} data-testid="input-staff-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-staff-role">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="chef">Chef</SelectItem>
                            <SelectItem value="worker">Worker</SelectItem>
                            <SelectItem value="serving_boy">Serving Boy</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="+91 XXXXX XXXXX" 
                            {...field} 
                            data-testid="input-staff-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 5 years" 
                            {...field} 
                            data-testid="input-staff-experience"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary (₹/month)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="1"
                            placeholder="25000" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-staff-salary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter image URL" 
                          {...field} 
                          data-testid="input-staff-image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleDialogClose}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit-staff"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Staff Members</CardTitle>
          <CardDescription>
            {staffList?.length || 0} team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : staffList && staffList.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffList.map((staff) => (
                    <TableRow key={staff.id} data-testid={`row-staff-${staff.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                            {staff.imageUrl ? (
                              <img src={staff.imageUrl} alt={staff.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <p className="font-semibold" data-testid={`text-staff-name-${staff.id}`}>{staff.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleColors[staff.role]} data-testid={`badge-role-${staff.id}`}>
                          {roleMap[staff.role]}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-phone-${staff.id}`}>{staff.phone}</TableCell>
                      <TableCell data-testid={`text-experience-${staff.id}`}>{staff.experience}</TableCell>
                      <TableCell className="font-semibold" data-testid={`text-salary-${staff.id}`}>
                        ₹{staff.salary.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(staff)}
                            data-testid={`button-edit-${staff.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(staff.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${staff.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No staff members yet</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first team member</p>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-staff">
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
