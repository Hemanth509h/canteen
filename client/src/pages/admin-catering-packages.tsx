import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import { insertCateringPackageSchema, type CateringPackage, type InsertCateringPackage } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

const tierColors: Record<string, string> = {
  budget: "text-green-600 dark:text-green-400",
  standard: "text-blue-600 dark:text-blue-400",
  premium: "text-amber-600 dark:text-amber-400",
};

export default function CateringPackagesManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CateringPackage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const { toast } = useToast();

  const { data: packages, isLoading } = useQuery<CateringPackage[]>({
    queryKey: ["/api/packages"],
  });

  const filteredPackages = packages?.filter((pkg) =>
    pkg.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    pkg.description.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const form = useForm<InsertCateringPackage>({
    resolver: zodResolver(insertCateringPackageSchema),
    defaultValues: {
      name: "",
      tier: "standard",
      description: "",
      pricePerPlate: 0,
      items: [],
      servings: 50,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCateringPackage) => {
      return apiRequest("POST", "/api/packages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({ title: "Success", description: "Package created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create package", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertCateringPackage }) => {
      return apiRequest("PATCH", `/api/packages/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({ title: "Success", description: "Package updated successfully" });
      setIsDialogOpen(false);
      setEditingPackage(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update package", variant: "destructive" });
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
      toast({ title: "Error", description: "Failed to delete package", variant: "destructive" });
    },
  });

  const handleOpenDialog = (pkg?: CateringPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      form.reset(pkg);
    } else {
      setEditingPackage(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPackage(null);
    form.reset();
  };

  const onSubmit = async (data: InsertCateringPackage) => {
    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Catering Packages
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage pre-built menu packages for quick booking
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              New Package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPackage ? "Edit Package" : "Create Package"}</DialogTitle>
              <DialogDescription>
                {editingPackage ? "Update package details" : "Create a new catering package"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Deluxe Birthday Package" {...field} data-testid="input-package-name" />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tier">
                            <SelectValue />
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Package details..." rows={3} {...field} data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pricePerPlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per Plate (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="servings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Servings</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 50)}
                          data-testid="input-servings"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="items"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Included Items (one per line)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Samosa&#10;Butter Chicken&#10;Biryani&#10;Gulab Jamun"
                          rows={4}
                          value={field.value.join('\n')}
                          onChange={(e) => field.onChange(e.target.value.split('\n').filter(item => item.trim()))}
                          data-testid="input-items"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit-package"
                  >
                    {editingPackage ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 border border-input rounded-lg px-3 py-2 bg-background">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 pl-0"
              data-testid="input-search-packages"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredPackages && filteredPackages.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Price/Plate</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Min. Servings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackages.map((pkg) => (
                    <motion.tr 
                      key={pkg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      data-testid={`row-package-${pkg.id}`}
                    >
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>
                        <Badge className={tierColors[pkg.tier]}>
                          {pkg.tier.charAt(0).toUpperCase() + pkg.tier.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{pkg.pricePerPlate}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {pkg.items.length} items
                      </TableCell>
                      <TableCell>{pkg.servings}</TableCell>
                      <TableCell className="text-right gap-2 flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDialog(pkg)}
                          data-testid={`button-edit-${pkg.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(pkg.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${pkg.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No packages found</p>
              <p className="text-sm mt-1">Create your first catering package to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
