import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit2, Plus, Package, RefreshCw } from "lucide-react";
import { insertCateringPackageSchema, type CateringPackage, type InsertCateringPackage } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/loading-spinner";

export default function CateringPackagesManager() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { data: packages, isLoading: packagesLoading, isFetching, refetch } = useQuery<CateringPackage[]>({
    queryKey: ["/api/packages"],
  });

  const { data: foodItems } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ["/api/food-items"],
  });

  const form = useForm<InsertCateringPackage>({
    resolver: zodResolver(insertCateringPackageSchema),
    defaultValues: {
      name: "",
      tier: "standard",
      description: "",
      pricePerPlate: 0,
      items: [],
      minServings: 20,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCateringPackage) => {
      if (editingId) {
        return apiRequest("PATCH", `/api/packages/${editingId}`, data);
      }
      return apiRequest("POST", "/api/packages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      form.reset();
      setEditingId(null);
      setSelectedItems([]);
      toast({
        title: "Success",
        description: editingId ? "Package updated successfully" : "Package created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save package",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/packages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({ title: "Success", description: "Package deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (pkg: CateringPackage) => {
    form.reset({
      name: pkg.name,
      tier: pkg.tier,
      description: pkg.description,
      pricePerPlate: pkg.pricePerPlate,
      items: pkg.items,
      minServings: pkg.minServings,
    });
    setSelectedItems(pkg.items);
    setEditingId(pkg.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    form.reset();
    setEditingId(null);
    setSelectedItems([]);
  };

  const onSubmit = (data: InsertCateringPackage) => {
    createMutation.mutate({
      ...data,
      items: selectedItems,
    });
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const tierColors: Record<string, string> = {
    budget: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    standard: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    premium: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            Catering Packages
          </h2>
          <p className="text-muted-foreground">
            Create and manage pre-built catering packages for your customers
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          data-testid="button-refresh-packages"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Form Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>{editingId ? "Edit Package" : "Create New Package"}</CardTitle>
              <CardDescription>
                {editingId
                  ? "Update package details and menu items"
                  : "Add a new catering package with tier and pricing"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Premium Wedding Package" {...field} data-testid="input-package-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tier</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tier">
                            <SelectValue placeholder="Select tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="budget">Budget</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what's included in this package..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        data-testid="textarea-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pricePerPlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per Plate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="250"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-price-per-plate"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Servings</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 20)}
                          data-testid="input-min-servings"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Menu Items Selection */}
              <FormItem>
                <FormLabel>Include Menu Items</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-input rounded-lg p-4">
                  {foodItems?.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{item.name}</span>
                    </label>
                  ))}
                </div>
                {selectedItems.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Select at least one menu item for this package
                  </p>
                )}
              </FormItem>

              <div className="flex gap-2 justify-end">
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={createMutation.isPending || selectedItems.length === 0}
                  data-testid="button-save-package"
                >
                  {createMutation.isPending ? "Saving..." : editingId ? "Update Package" : "Create Package"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Packages List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">All Packages</h3>
        {packagesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : packages && packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="flex flex-col" data-testid={`card-package-${pkg.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <Badge className={`mt-2 ${tierColors[pkg.tier]}`}>{pkg.tier.toUpperCase()}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price/Plate:</span>
                      <span className="font-medium">₹{pkg.pricePerPlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Servings:</span>
                      <span className="font-medium">{pkg.minServings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items:</span>
                      <span className="font-medium">{pkg.items.length}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(pkg)}
                      className="flex-1"
                      data-testid={`button-edit-package-${pkg.id}`}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => deleteMutation.mutate(pkg.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-package-${pkg.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No packages created yet</p>
              <p className="text-sm text-muted-foreground">Create your first package to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
