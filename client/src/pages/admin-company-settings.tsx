import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building2 } from "lucide-react";
import { insertCompanyInfoSchema, type CompanyInfo, type InsertCompanyInfo } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CompanySettingsManager() {
  const { toast } = useToast();

  const { data: companyInfo, isLoading } = useQuery<CompanyInfo>({
    queryKey: ["/api/company-info"],
  });

  const form = useForm<InsertCompanyInfo>({
    resolver: zodResolver(insertCompanyInfoSchema.extend({
      eventsPerYear: insertCompanyInfoSchema.shape.eventsPerYear.refine((val) => val > 0, {
        message: "Events per year must be greater than 0",
      }),
    })),
    values: companyInfo ? {
      companyName: companyInfo.companyName,
      tagline: companyInfo.tagline,
      description: companyInfo.description,
      email: companyInfo.email,
      phone: companyInfo.phone,
      address: companyInfo.address,
      eventsPerYear: companyInfo.eventsPerYear,
      websiteUrl: companyInfo.websiteUrl || "",
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertCompanyInfo) => {
      if (companyInfo) {
        return apiRequest("PATCH", `/api/company-info/${companyInfo.id}`, data);
      } else {
        return apiRequest("POST", "/api/company-info", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-info"] });
      toast({ title: "Success", description: "Company information updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update company information", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertCompanyInfo) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Company Settings
        </h2>
        <p className="text-muted-foreground">
          Update your business information and contact details
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                This information will be displayed on your customer-facing website
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name <span className="text-xs text-muted-foreground">(Optional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Premium Catering Services" {...field} data-testid="input-company-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline <span className="text-xs text-muted-foreground">(Optional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Exceptional Food for Unforgettable Events" {...field} data-testid="input-tagline" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description <span className="text-xs text-muted-foreground">(Optional)</span></FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell customers about your catering business..." 
                          {...field} 
                          data-testid="input-description"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email <span className="text-xs text-muted-foreground">(Optional)</span></FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="info@catering.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone <span className="text-xs text-muted-foreground">(Optional)</span></FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 (555) 123-4567" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address <span className="text-xs text-muted-foreground">(Optional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, City, State 12345" {...field} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="eventsPerYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Events Per Year <span className="text-xs text-muted-foreground">(Optional)</span></FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="500" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            data-testid="input-events-per-year"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input 
                            type="url" 
                            placeholder="https://www.example.com" 
                            {...field}
                            value={field.value || ""}
                            data-testid="input-website-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    data-testid="button-save-settings"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
