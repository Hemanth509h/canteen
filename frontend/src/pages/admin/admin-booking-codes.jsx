import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Ticket, Key, CheckCircle, XCircle, Trash2, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookingCodeManager() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCode, setNewCode] = useState({ code: "", notes: "", expiresAt: "" });

  const { data: codesResponse, isLoading: codesLoading } = useQuery({
    queryKey: ["/api/booking-codes"],
  });

  const { data: requestsResponse, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/code-requests"],
  });

  const codes = codesResponse?.data || [];
  const requests = requestsResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/booking-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/booking-codes"] });
      setIsCreateOpen(false);
      setNewCode({ code: "", notes: "", expiresAt: "" });
      toast({ title: "Success", description: "Booking code created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/booking-codes/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/booking-codes"] });
      toast({ title: "Deleted", description: "Booking code removed" });
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(`/api/code-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/code-requests"] });
      toast({ title: "Updated", description: "Request status updated" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Booking Codes</h2>
          <p className="text-muted-foreground">Manage exclusive booking access and customer requests.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Create New Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Booking Code</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Code</Label>
                <Input 
                  id="code" 
                  placeholder="e.g. VIP2024" 
                  value={newCode.code}
                  onChange={(e) => setNewCode({...newCode, code: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                <Input 
                  id="expiresAt" 
                  type="date" 
                  value={newCode.expiresAt}
                  onChange={(e) => setNewCode({...newCode, expiresAt: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Internal notes..." 
                  value={newCode.notes}
                  onChange={(e) => setNewCode({...newCode, notes: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate(newCode)}>Create Code</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="active" className="gap-2">
            <Key className="w-4 h-4" /> Active Codes
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <Ticket className="w-4 h-4" /> Requests
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-[10px]">
                {requests.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Generated Codes</CardTitle>
              <CardDescription>All active and used booking codes.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-bold">{code.code}</TableCell>
                      <TableCell>
                        <Badge variant={code.isUsed ? "secondary" : "default"}>
                          {code.isUsed ? "Used" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{code.notes || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(code.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {codes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No booking codes found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Customer Requests</CardTitle>
              <CardDescription>Manage incoming requests for booking codes.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Event Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.customerName}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <p>{req.customerEmail}</p>
                          <p className="text-muted-foreground">{req.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{req.eventDetails || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={
                          req.status === 'granted' ? 'success' : 
                          req.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => updateRequestMutation.mutate({ id: req.id, status: 'granted' })}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Grant
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-destructive border-red-200 hover:bg-red-50"
                              onClick={() => updateRequestMutation.mutate({ id: req.id, status: 'rejected' })}
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {requests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No requests found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
