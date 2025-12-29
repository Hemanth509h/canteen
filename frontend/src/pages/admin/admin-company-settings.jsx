import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building2, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CompanySettingsManager() {
  const { toast } = useToast();

  const { data: companyInfo, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["/api/company-info"],
  });

  const form = useForm({
    values: companyInfo || {},
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return apiRequest("PATCH", "/api/company-info/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-info"] });
      toast({ title: "Success", description: "Updated successfully" });
    },
  });

  const onSubmit = (data) => updateMutation.mutate(data);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Company Settings</h2>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />Business Info</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-40 w-full" /> : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={updateMutation.isPending}>Save Changes</Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
