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
import { insertStaffSchema, updateStaffSchema } from "@/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ConfirmDialog } from "@/components/features/confirm-dialog";

const roleMap = {
  "chef": "Chef",
  "worker": "Worker",
  "serving_boy": "Serving Boy"
};

const roleColors = {
  chef: "default",
  worker: "secondary",
  serving_boy: "secondary",
};

export default function StaffManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [roleFilter, setRoleFilter] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const { toast } = useToast();

  const { data: staffList, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["/api/staff"],
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
    resolver: zodResolver(editingStaff ? updateStaffSchema : insertStaffSchema),
    defaultValues: {
      name: "",
      role: "chef",
      phone: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return apiRequest("POST", "/api/staff", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({ title: "Staff Added" });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data) => {
    if (editingStaff) {
      // update
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Staff Management</h2>
        <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Add Staff</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              ) : filteredStaffList?.map(staff => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell><Badge variant={roleColors[staff.role]}>{roleMap[staff.role]}</Badge></TableCell>
                  <TableCell>{staff.phone}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Staff</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Save</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
