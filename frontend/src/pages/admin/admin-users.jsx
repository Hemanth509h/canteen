import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { KeyRound, Pencil, Plus, ShieldCheck, Trash2, UserCog } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/features/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const EMPTY_FORM = { name: "", username: "", password: "", role: "accountant" };
const ROLE_LABELS = { superadmin: "Super Admin", accountant: "Accountant", chef: "Chef" };

async function readResponse(response) {
  const payload = await response.json();
  return payload?.data ?? payload;
}

export default function AdminUsers() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery({ queryKey: ["/api/admin/users"] });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name || "", username: user.username || "", password: "", role: user.role || "accountant" });
    setFormError("");
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await apiRequest(editingUser ? "PATCH" : "POST", editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users", payload);
      return readResponse(response);
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: editingUser ? "Admin updated" : "Admin added", description: `${user.username} can now use the assigned admin role.` });
      closeDialog();
    },
    onError: (error) => setFormError(error.message || "Unable to save admin user"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest("DELETE", `/api/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Admin removed", description: "The user can no longer sign in." });
      setDeleteUser(null);
    },
    onError: (error) => toast({ title: "Unable to remove admin", description: error.message, variant: "destructive" }),
  });

  const submit = (event) => {
    event.preventDefault();
    const username = form.username.trim().toLowerCase();
    if (username.length < 3) return setFormError("Username must be at least 3 characters.");
    if (!editingUser && form.password.length < 6) return setFormError("Password must be at least 6 characters.");
    if (editingUser && form.password && form.password.length < 6) return setFormError("New password must be at least 6 characters.");

    const payload = { name: form.name.trim(), username, role: form.role };
    if (form.password) payload.password = form.password;
    setFormError("");
    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Admin Users</h2>
          <p className="mt-1 text-muted-foreground">Create logins and control access by role.</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 size-4" /> Add Admin User</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(ROLE_LABELS).map(([role, label]) => (
          <Card key={role}><CardContent className="flex items-center gap-3 p-4"><ShieldCheck className="size-5 text-primary" /><div><p className="text-2xl font-bold">{users.filter((user) => user.role === role).length}</p><p className="text-xs text-muted-foreground">{label}s</p></div></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserCog className="size-5 text-primary" /> Administrator Accounts</CardTitle><CardDescription>Passwords are encrypted and never displayed after saving.</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-12 w-full" />)}</div> : users.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center"><UserCog className="mx-auto mb-3 size-10 text-muted-foreground" /><p className="font-semibold">No database admin users yet</p><p className="mt-1 text-sm text-muted-foreground">The environment fallback admin may still be active. Add a named account for normal use.</p></div>
          ) : (
            <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Username</TableHead><TableHead>Role</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
              {users.map((user) => <TableRow key={user.id}><TableCell className="font-medium">{user.name || "—"}</TableCell><TableCell>{user.username}</TableCell><TableCell><Badge variant={user.role === "superadmin" ? "default" : "secondary"}>{ROLE_LABELS[user.role] || user.role}</Badge></TableCell><TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(user)} aria-label={`Edit ${user.username}`}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteUser(user)} aria-label={`Delete ${user.username}`}><Trash2 className="size-4" /></Button></div></TableCell></TableRow>)}
            </TableBody></Table></div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => open ? setDialogOpen(true) : closeDialog()}>
        <DialogContent className="sm:max-w-lg"><form onSubmit={submit}><DialogHeader><DialogTitle>{editingUser ? "Edit Admin User" : "Add Admin User"}</DialogTitle><DialogDescription>{editingUser ? "Update account details or enter a new password." : "Create a secure login and assign its access level."}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-5">
            <div className="space-y-2"><Label htmlFor="admin-name">Display Name</Label><Input id="admin-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></div>
            <div className="space-y-2"><Label htmlFor="admin-username">Username</Label><Input id="admin-username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="At least 3 characters" required /></div>
            <div className="space-y-2"><Label htmlFor="admin-role">Role</Label><Select value={form.role} onValueChange={(role) => setForm({ ...form, role })}><SelectTrigger id="admin-role"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="superadmin">Super Admin — full access</SelectItem><SelectItem value="accountant">Accountant — bookings and finance</SelectItem><SelectItem value="chef">Chef — kitchen and menu</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="admin-password">{editingUser ? "New Password (optional)" : "Password"}</Label><div className="relative"><KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="admin-password" type="password" autoComplete="new-password" className="pl-9" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 characters" required={!editingUser} /></div></div>
            {formError && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>}
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button><Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : editingUser ? "Save Changes" : "Add Admin"}</Button></DialogFooter>
        </form></DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)} title="Remove admin user?" description={`Delete ${deleteUser?.username || "this user"}? They will immediately lose access.`} confirmText="Remove User" variant="destructive" isLoading={deleteMutation.isPending} onConfirm={() => deleteUser && deleteMutation.mutate(deleteUser.id)} />
    </div>
  );
}
