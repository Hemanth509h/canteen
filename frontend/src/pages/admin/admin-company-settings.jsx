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
import { CompanyInfo, InsertCompanyInfo } from "@/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CompanySettingsManager() {
  const { toast } = useToast();

  const { data: companyInfo, isLoading, isFetching, refetch } = useQuery({
    queryKey"/api/company-info"],
  });

  const form = useForm({
    valuesompanyInfo ? {
      companyNameompanyInfo.companyName,
      taglineompanyInfo.tagline,
      descriptionompanyInfo.description,
      emailompanyInfo.email,
      phoneompanyInfo.phone,
      addressompanyInfo.address,
      eventsPerYearompanyInfo.eventsPerYear,
      yearsExperienceompanyInfo.yearsExperience || 15,
      websiteUrlompanyInfo.websiteUrl || "",
      upiIdompanyInfo.upiId || "",
      minAdvanceBookingDaysompanyInfo.minAdvanceBookingDays || 2,
    } ndefined,
  });

  const updateMutation = useMutation({
    mutationFnsync (datansertCompanyInfo) => {
      return apiRequest("PATCH", "/api/company-info/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey"/api/company-info"] });
      toast({ title: "Success", description: "Company information updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update company information", variant: "destructive" });
    },
  });

  const onSubmit = (datansertCompanyInfo) => {
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

      
        
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary" />
            <div>
              Business Information</CardTitle>
              
                This information will be displayed on your customer-facing website
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
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
                    
                      Company Name</FormLabel>
                      
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
                    
                      Tagline</FormLabel>
                      
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
                    
                      Description</FormLabel>
                      
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
                      
                        Email</FormLabel>
                        
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
                      
                        Phone</FormLabel>
                        
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
                    
                      Address</FormLabel>
                      
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
                      
                        Total Events Served</FormLabel>
                        
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
                      
                        Years of Experience</FormLabel>
                        
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
                    
                      Website URL</FormLabel>
                      
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
                    
                      UPI ID (for payment collection)</FormLabel>
                      
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
                    
                      Minimum Advance Booking Days</FormLabel>
                      
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
