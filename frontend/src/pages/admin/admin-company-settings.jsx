import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building2, RefreshCw, Upload } from "lucide-react";
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
      primaryColor: companyInfo.primaryColor || "#ea580c",
      logoUrl: companyInfo.logoUrl || "",
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
      primaryColor: "#ea580c",
      logoUrl: "",
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

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('svg') && !file.type.includes('image')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an SVG or image file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue("logoUrl", reader.result);
    };
    reader.readAsDataURL(file);
  };

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-3">
                            <Input 
                              type="color" 
                              {...field}
                              className="w-12 h-10 p-1 rounded-md"
                              data-testid="input-primary-color-picker"
                            />
                            <Input 
                              type="text" 
                              {...field}
                              placeholder="#ea580c"
                              data-testid="input-primary-color-hex"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Logo Management</FormLabel>
                    <div className="flex flex-col gap-4">
                      <FormField
                        control={form.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input 
                                  placeholder="https://example.com/logo.png" 
                                  {...field}
                                  value={field.value || ""}
                                  data-testid="input-logo-url"
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                  }}
                                />
                                <Button 
                                  type="button" 
                                  variant="outline"
                                  onClick={() => field.onChange("/leaf_logo.svg")}
                                >
                                  Use Generated
                                </Button>
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept="image/svg+xml,image/*"
                                    className="hidden"
                                    id="logo-upload"
                                    onChange={handleLogoUpload}
                                  />
                                  <Button 
                                    type="button"
                                    variant="outline"
                                    asChild
                                  >
                                    <label htmlFor="logo-upload" className="cursor-pointer flex items-center gap-2">
                                      <Upload className="w-4 h-4" />
                                      Upload
                                    </label>
                                  </Button>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form.watch("logoUrl") && (
                        <div className="p-4 border rounded-lg bg-muted/50 flex items-center justify-center min-h-[100px]">
                          <img 
                            key={form.watch("logoUrl")}
                            src={form.watch("logoUrl")} 
                            alt="Logo Preview" 
                            className="max-h-20 w-auto object-contain"
                            crossOrigin="anonymous"
                            onLoad={(e) => {
                              console.log("Logo preview loaded successfully");
                              e.target.style.display = 'block';
                            }}
                            onError={(e) => {
                              console.error("Logo preview failed to load:", e.target.src);
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
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
