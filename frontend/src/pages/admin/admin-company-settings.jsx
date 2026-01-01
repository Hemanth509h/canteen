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
    defaultValues: companyInfo ? {
      companyName: companyInfo.companyName,
      tagline: companyInfo.tagline,
      description: companyInfo.description,
      email: companyInfo.email,
      phone: companyInfo.phone,
      address: companyInfo.address,
      eventsPerYear: companyInfo.eventsPerYear,
      yearsExperience: companyInfo.yearsExperience || 15,
      websiteUrl: companyInfo.websiteUrl || "",
      upiId: companyInfo.upiId || "",
      minAdvanceBookingDays: companyInfo.minAdvanceBookingDays || 2,
    } : {
      companyName: "",
      tagline: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      eventsPerYear: 0,
      yearsExperience: 15,
      websiteUrl: "",
      upiId: "",
      minAdvanceBookingDays: 2,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return apiRequest("PATCH", "/api/company-info", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-info"] });
      toast({ title: "Success", description: "Company information updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update company information", variant: "destructive" });
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Company Settings
          </h2>
          <p className="text-muted-foreground">
            Update your business information and contact details
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          data-testid="button-refresh-settings"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
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
                      <FormLabel>Company Name</FormLabel>
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
                      <FormLabel>Tagline</FormLabel>
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
                      <FormLabel>Description</FormLabel>
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
                        <FormLabel>Email</FormLabel>
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
                        <FormLabel>Phone</FormLabel>
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
                      <FormLabel>Address</FormLabel>
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
                        <FormLabel>Total Events Served</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="500" 
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-events-per-year"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearsExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="15" 
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-years-experience"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                <FormField
                  control={form.control}
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UPI ID (for payment collection)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="example@upi" 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-upi-id"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minAdvanceBookingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Advance Booking Days</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2" 
                          min="0"
                          max="30"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 2)}
                          data-testid="input-min-advance-booking-days"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Number of days in advance customers must book events (0-30 days)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
