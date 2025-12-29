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

const actionColorMap = {
  booking_created: { bg: "bg-green-100", text: "text-green-700" },
  booking_updated: { bg: "bg-blue-100", text: "text-blue-700" },
  staff_created: { bg: "bg-purple-100", text: "text-purple-700" },
};

const actionIcons = {
  booking_created: <Plus className="w-4 h-4" />,
  booking_updated: <Clock className="w-4 h-4" />,
  staff_created: <Plus className="w-4 h-4" />,
};

export default function AuditHistory() {
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const { toast } = useToast();

  const { data: auditHistory, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["/api/audit-history", entityTypeFilter],
    queryFn: async () => {
      const params = entityTypeFilter !== "all" ? `?entityType=${entityTypeFilter}` : "";
      const response = await fetch(`/api/audit-history${params}`);
      return response.json();
    },
  });

  const getActionLabel = (action) => action.replace(/_/g, " ");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><History className="w-6 h-6" />Audit History</h1>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              ) : auditHistory?.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm">{new Date(entry.createdAt).toLocaleString()}</TableCell>
                  <TableCell><Badge className={actionColorMap[entry.action]?.bg}>{getActionLabel(entry.action)}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{entry.entityType}</Badge></TableCell>
                  <TableCell className="text-sm">{JSON.stringify(entry.details).slice(0, 50)}...</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
