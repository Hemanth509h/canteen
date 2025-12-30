import { useQuery, useMutation } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { History, CheckCircle, AlertCircle, Clock, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ConfirmDialog } from "@/components/features/confirm-dialog";

interface AuditHistoryEntry {
  idtring;
  actiontring;
  entityType: "booking" | "staff" | "payment" | "assignment";
  entityIdtring;
  detailsecord<string, unknown>;
  createdAttring;
}

const actionColorMapecord<string, { bgtring; texttring }> = {
  booking_created: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  booking_updated: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  staff_created: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
  staff_updated: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300" },
  assignment_created: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  assignment_updated: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  assignment_deleted: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
};

const actionIconsecord<string, any> = {
  booking_createdPlus className="w-4 h-4" />,
  booking_updatedClock className="w-4 h-4" />,
  staff_createdPlus className="w-4 h-4" />,
  staff_updatedClock className="w-4 h-4" />,
  assignment_createdCheckCircle className="w-4 h-4" />,
  assignment_updatedCheckCircle className="w-4 h-4" />,
  assignment_deletedAlertCircle className="w-4 h-4" />,
};

export default function AuditHistory() {
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { toast } = useToast();

  const { datauditHistory, isLoading, isFetching, refetch } = useQuery<AuditHistoryEntry[]>({
    queryKey"/api/audit-history", entityTypeFilter],
    queryFnsync () => {
      const params = entityTypeFilter !== "all" ? `?entityType=${entityTypeFilter}` : "";
      const response = await fetch(`/api/audit-history${params}`);
      if (!response.ok) throw new Error("Failed to fetch audit history");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFnsync (idtring) => {
      return apiRequest("DELETE", `/api/audit-history/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey"/api/audit-history"] });
      toast({
        title: "Deleted",
        description: "Audit history entry has been removed"
      });
      setDeleteTargetId(null);
    },
    onError: (errorny) => {
      toast({
        title: "Failed to Delete",
        descriptionrror?.message || "Unable to delete audit history entry",
        variant: "destructive"
      });
    },
  });

  const handleDeleteClick = (idtring) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
      setDeleteConfirmOpen(false);
    }
  };

  const formatDate = (dateStrtring) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionLabel = (actiontring) => {
    return action.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <div
      className="space-y-6 p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="w-8 h-8 text-primary" />
            Audit History
          </h1>
          <p className="text-muted-foreground mt-1">Track all system changes and actions</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          data-testid="button-refresh-audit"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Activity Log</CardTitle>
              <CardDescription className="text-sm">Complete history of all bookings, staff, and assignments</CardDescription>
            </div>
            <div className="w-full sm:w-48">
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger data-testid="select-entity-type-filter">
                  <SelectValue placeholder="Filter by type..." />
                </SelectTrigger>
                
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="booking">Bookings</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="assignment">Assignments</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) uditHistory && auditHistory.length > 0 ? (
            <div className="space-y-3">
              {/* Mobile View */}
              <div className="block md:hidden space-y-2">
                {auditHistory.map((entry, index) => {
                  const colors = actionColorMap[entry.action] || { bg: "bg-gray-100", text: "text-gray-700" };
                  return (
                    <div key={entry.id} className="p-3 border border-border rounded-lg bg-card/50">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge className={`${colors.bg} ${colors.text} border-0 text-xs flex items-center gap-1`}>
                          {actionIcons[entry.action]}
                          {getActionLabel(entry.action)}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClick(entry.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-audit-${entry.id}`}
                          className="h-6 w-6"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{formatDate(entry.createdAt)}</p>
                      <p className="text-xs font-mono text-muted-foreground">ID: {entry.entityId.slice(0, 8)}...</p>
                    </div>
                  );
                })}
              </div>
              
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
              
                
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="font-semibold">Time</TableHead>
                    <TableHead className="font-semibold">Action</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Entity ID</TableHead>
                    <TableHead className="font-semibold">Details</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                
                  {auditHistory.map((entry, index) => {
                    const colors = actionColorMap[entry.action] || { bg: "bg-gray-100", text: "text-gray-700" };
                    return (
                      <tr
                        key={entry.id}
                        className="animate-in fade-in duration-300 border-b border-border/30 hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="text-sm text-muted-foreground py-3">
                          {formatDate(entry.createdAt)}
                        </TableCell>
                        
                          <Badge className={`${colors.bg} ${colors.text} border-0 flex items-center gap-1.5 w-fit`}>
                            {actionIcons[entry.action]}
                            {getActionLabel(entry.action)}
                          </Badge>
                        </TableCell>
                        
                          <Badge variant="outline" className="capitalize">
                            {entry.entityType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {entry.entityId.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-sm max-w-md">
                          <div className="bg-muted/50 p-2 rounded text-xs space-y-1">
                            {entry.details.clientName && (
                              <div><span className="font-semibold">Client:</span> {String(entry.details.clientName)}</div>
                            )}
                            {entry.details.eventType && (
                              <div><span className="font-semibold">Event:</span> {String(entry.details.eventType)}</div>
                            )}
                            {entry.details.eventDate && (
                              <div><span className="font-semibold">Date:</span> {String(entry.details.eventDate)}</div>
                            )}
                            {entry.details.guestCount && (
                              <div><span className="font-semibold">Guests:</span> {String(entry.details.guestCount)}</div>
                            )}
                            {entry.details.name && (
                              <div><span className="font-semibold">Name:</span> {String(entry.details.name)}</div>
                            )}
                            {entry.details.role && (
                              <div><span className="font-semibold">Role:</span> {String(entry.details.role)}</div>
                            )}
                            {entry.details.status && (
                              <div><span className="font-semibold">Status:</span> {String(entry.details.status)}</div>
                            )}
                            {entry.details.newStatus && (
                              <div><span className="font-semibold">New Status:</span> {String(entry.details.newStatus)}</div>
                            )}
                            {entry.details.advancePaymentStatus && (
                              <div><span className="font-semibold">Advance:</span> {String(entry.details.advancePaymentStatus)}</div>
                            )}
                            {entry.details.finalPaymentStatus && (
                              <div><span className="font-semibold">Final:</span> {String(entry.details.finalPaymentStatus)}</div>
                            )}
                            {(() => {
                              const hasKnownField = entry.details.clientName || entry.details.eventType || 
                                entry.details.eventDate || entry.details.guestCount || entry.details.name || 
                                entry.details.role || entry.details.status || entry.details.newStatus || 
                                entry.details.advancePaymentStatus || entry.details.finalPaymentStatus;
                              return !hasKnownField ? (
                                <div className="font-mono text-muted-foreground">{JSON.stringify(entry.details).slice(0, 150)}</div>
                              ) ull;
                            })()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick(entry.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-audit-${entry.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </tr>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No activity found</p>
              <p className="text-sm text-muted-foreground/70">Start by creating bookings, staff, or assignments</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Audit Log Entry"
        description="This action cannot be undone. Are you sure you want to delete this audit history entry?"
        onConfirm={confirmDelete}
        isDangerous
      />
    </div>
  );
}
