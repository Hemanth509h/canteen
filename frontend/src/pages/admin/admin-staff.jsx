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
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Plus, Pencil, Trash2, User, Search, RefreshCw } from "lucide-react";
import { insertStaffSchema, updateStaffSchema, Staff, InsertStaff, UpdateStaff } from "@/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ConfirmDialog } from "@/components/features/confirm-dialog";
import { EmptyState } from "@/components/features/empty-state";
import { PageLoader, TableSkeleton } from "@/components/features/loading-spinner";

const roleMapecord<string, string> = {
  "chef": "Chef",
  "worker": "Worker",
  "serving_boy": "Serving Boy"
};

const roleColorsecord<string, "default" | "secondary" | "destructive"> = {
  chef: "default",
  worker: "secondary",
  serving_boy: "secondary",
};

export default function StaffManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "role">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const { toast } = useToast();

  const { datataffList, isLoading, isFetching, refetch } = useQuery<Staff[]>({
    queryKey"/api/staff"],
  });

  const filteredStaffList = staffList?.filter((staff) => {
    const matchesSearch = staff.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      roleMap[staff.role].toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (staff.phone && staff.phone.includes(debouncedSearch));
    const matchesRole = !roleFilter || staff.role === roleFilter;
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    let compareValue = 0;
    if (sortBy === "name") {
      compareValue = a.name.localeCompare(b.name);
    } else if (sortBy === "role") {
      compareValue = roleMap[a.role].localeCompare(roleMap[b.role]);
    }
    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  const form = useForm({
    resolverodResolver(editingStaff ? updateStaffSchema nsertStaffSchema),
    defaultValues: {
      name: "",
      role: "chef",
      phone: "",
    },
  });

  const createMutation = useMutation({
    mutationFnsync (datansertStaff) => {
      return apiRequest("POST", "/api/staff", data);
    },
    onSuccess: (datany) => {
      queryClient.invalidateQueries({ queryKey"/api/staff"] });
      toast({ 
        title: "Staff Added", 
        description: `${data.name} has been added to your team` 
      });
      setIsDialogOpen(false);
      form.reset({
        name: "",
        role: "chef",
        phone: "",
      });
    },
    onError: (errorny) => {
      toast({ 
        title: "Failed to Add Staff", 
        descriptionrror?.message || "Please check that all required fields are filled correctly.",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFnsync ({ id, data }: { idtring; datapdateStaff }) => {
      return apiRequest("PATCH", `/api/staff/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey"/api/staff"] });
      toast({ 
        title: "Updated", 
        description: "Staff member details have been updated successfully" 
      });
      setIsDialogOpen(false);
      setEditingStaff(null);
      form.reset();
    },
    onError: (errorny) => {
      toast({ 
        title: "Update Failed", 
        descriptionrror?.message || "Unable to update staff member. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFnsync (idtring) => {
      return apiRequest("DELETE", `/api/staff/${id}`, undefined);
    },
    onSuccesssync () => {
      await queryClient.invalidateQueries({ queryKey"/api/staff"], refetchType: 'all' });
      toast({ 
        title: "Removed", 
        description: `${deleteTargetName} has been removed from the team` 
      });
      setDeleteTargetId(null);
    },
    onError: (errorny) => {
      toast({ 
        title: "Delete Failed", 
        descriptionrror?.message || "Unable to remove this staff member.",
        variant: "destructive" 
      });
    },
  });

  const handleEdit = (stafftaff) => {
    setEditingStaff(staff);
    form.reset({
      nametaff.name,
      roletaff.role,
      phonetaff.phone,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (idtring, nametring) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
    }
  };

  const onSubmit = (datapdateStaff) => {
    if (editingStaff) {
      updateMutation.mutate({ idditingStaff.id, data });
    } else {
      createMutation.mutate(data as InsertStaff);
    }
  };

  const handleDialogClose = (openoolean) => {
    if (!open) {
      setIsDialogOpen(false);
      setEditingStaff(null);
      form.reset({
        name: "",
        role: "chef",
        phone: "",
      });
    }
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh-staff"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (open) {
              setIsDialogOpen(true);
            } else {
              handleDialogClose(false);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-staff">
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </Button>
            </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            
              <DialogTitle className="text-lg sm:text-xl">
                {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {editingStaff ? "Update staff member details" : "Add a new team member"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    
                      Name</FormLabel>
                      
                        <Input placeholder="Staff member name" {...field} data-testid="input-staff-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      
                        Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          
                            <SelectTrigger data-testid="select-staff-role">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          
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
                      
                        Phone</FormLabel>
                        
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
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleDialogClose(false)}
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
      </div>

      
        
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                All Staff Members</CardTitle>
                
                  {filteredStaffList?.length || 0} of {staffList?.length || 0} team members
                </CardDescription>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-staff"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={sortBy} onValueChange={(valueny) => setSortBy(value)} data-testid="select-sort-staff">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                data-testid="button-toggle-sort-staff"
                className="w-full sm:w-auto"
              >
                {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
              </Button>
              <Select value={roleFilter || "none"} onValueChange={(value) => setRoleFilter(value === "none" ? "" alue)} data-testid="select-role-filter">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                
                  <SelectItem value="none">All Roles</SelectItem>
                  <SelectItem value="chef">Chef</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                  <SelectItem value="serving_boy">Serving Boy</SelectItem>
                </SelectContent>
              </Select>
              {roleFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRoleFilter("")}
                  data-testid="button-clear-role-filter"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) ilteredStaffList && filteredStaffList.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {filteredStaffList.map((staff) => (
                  <div key={staff.id} className="p-3 border border-border rounded-lg flex items-center gap-3 justify-between" data-testid={`card-staff-mobile-${staff.id}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" data-testid={`text-staff-name-${staff.id}`}>{staff.name}</p>
                        <p className="text-xs text-muted-foreground" data-testid={`text-phone-${staff.id}`}>{staff.phone}</p>
                        <Badge variant={roleColors[staff.role]} className="text-xs mt-1" data-testid={`badge-role-${staff.id}`}>
                          {roleMap[staff.role]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleEdit(staff)} data-testid={`button-edit-mobile-${staff.id}`}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleDelete(staff.id, staff.name)} disabled={deleteMutation.isPending} data-testid={`button-delete-mobile-${staff.id}`}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                
                  
                    
                      Name</TableHead>
                      Role</TableHead>
                      Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  
                    {filteredStaffList.map((staff) => (
                      <TableRow key={staff.id} data-testid={`row-staff-${staff.id}`}>
                        
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                              <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <p className="font-semibold" data-testid={`text-staff-name-${staff.id}`}>{staff.name}</p>
                          </div>
                        </TableCell>
                        
                          <Badge variant={roleColors[staff.role]} data-testid={`badge-role-${staff.id}`}>
                            {roleMap[staff.role]}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-phone-${staff.id}`}>{staff.phone}</TableCell>
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
                              onClick={() => handleDelete(staff.id, staff.name)}
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
            </>

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

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Remove Staff Member"
        description={`Are you sure you want to remove ${deleteTargetName} from the team? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Keep"
        variant="destructive"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
