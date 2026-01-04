import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Pencil, Trash2, ImagePlus, Search, UtensilsCrossed, RefreshCw } from "lucide-react";
import { insertFoodItemSchema } from "@/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ConfirmDialog } from "@/components/features/confirm-dialog";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useUpload } from "@/hooks/use-upload";

const defaultCategories = [];

export default function FoodItemsManager() {
  const { getUploadParameters } = useUpload();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const { toast } = useToast();

  const { data: foodItems = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["/api/food-items"],
  });

  const filteredFoodItems = (foodItems || []).filter((item) => {
    const matchesSearch = (item.name || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    let compareValue = 0;
    if (sortBy === "name") {
      compareValue = (a.name || "").localeCompare(b.name || "");
    } else if (sortBy === "category") {
      compareValue = (a.category || "").localeCompare(b.category || "");
    }
    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  const allCategories = foodItems && foodItems.length > 0
    ? Array.from(new Set([...defaultCategories, ...foodItems.map(item => item.category)])).sort()
    : defaultCategories;

  const form = useForm({
    resolver: zodResolver(insertFoodItemSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "Veg",
      category: "Veg Starters",
      imageUrl: "",
    },
  });

  const selectedType = form.watch("type");

  const filteredCategories = useMemo(() => {
    return allCategories.filter(cat => {
      // Find at least one item in the database that has this category and the selected type
      const categoryItems = foodItems.filter(item => item.category === cat);
      if (categoryItems.length === 0) return true; // Keep default categories or empty categories
      
      return categoryItems.some(item => item.type === selectedType);
    });
  }, [selectedType, allCategories, foodItems]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return apiRequest("POST", "/api/food-items", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      toast({ 
        title: "Item Added", 
        description: `${data.name} has been added to your menu` 
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ 
        title: "Failed to Add Item", 
        description: error?.message || "Please check that all required fields are filled correctly.",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return apiRequest("PATCH", `/api/food-items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      toast({ 
        title: "Updated", 
        description: "Food item details have been updated successfully" 
      });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: (error) => {
      toast({ 
        title: "Update Failed", 
        description: error?.message || "Unable to update food item. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return apiRequest("DELETE", `/api/food-items/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      toast({ 
        title: "Removed", 
        description: `${deleteTargetName} has been removed from your menu` 
      });
      setDeleteTargetId(null);
    },
    onError: (error) => {
      toast({ 
        title: "Delete Failed", 
        description: error?.message || "Unable to remove this food item.",
        variant: "destructive" 
      });
    },
  });

  const dietaryOptions = ["Vegan", "Gluten-Free", "Non-Veg", "Spicy", "Nut-Free", "Dairy-Free"];

  const handleEdit = (item) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      description: item.description,
      type: item.type || "Veg",
      category: item.category,
      imageUrl: item.imageUrl || "",
      dietaryTags: item.dietaryTags || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id, name) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
    }
  };

  const onSubmit = (data) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    form.reset();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground">
              Food Items
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your menu items and categories
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh-food-items"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) {
              handleDialogClose();
            } else {
              setIsDialogOpen(true);
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-food-item">
                <Plus className="w-4 h-4 mr-2" />
                Add Food Item
              </Button>
            </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingItem ? "Edit Food Item" : "Add New Food Item"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {editingItem ? "Update the food item details" : "Add a new item to your menu"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Food item name" {...field} data-testid="input-food-name" />
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
                          placeholder="Describe the food item" 
                          {...field} 
                          data-testid="input-food-description"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Veg">Veg</SelectItem>
                          <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <div className="flex gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-food-category" className="flex-1">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {filteredCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => setIsCategoryDialogOpen(true)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            placeholder="Image URL" 
                            {...field}
                            value={field.value || ""}
                            className="flex-1"
                            data-testid="input-food-image"
                          />
                        </FormControl>
                        <ObjectUploader
                          maxFileSize={5 * 1024 * 1024}
                          onGetUploadParameters={getUploadParameters}
                          onComplete={(result) => {
                            if (result.successful?.[0]) {
                              const url = result.successful[0].uploadURL.split('?')[0];
                              form.setValue("imageUrl", url);
                              toast({ title: "Image Uploaded", description: "Image has been uploaded successfully." });
                            }
                          }}
                        >
                          <ImagePlus className="w-4 h-4 mr-2" />
                          Upload
                        </ObjectUploader>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dietaryTags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Tags (optional)</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {dietaryOptions.map((tag) => (
                          <label key={tag} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.value?.includes(tag) || false}
                              onChange={(e) => {
                                const newTags = e.target.checked
                                  ? [...(field.value || []), tag]
                                  : field.value?.filter(t => t !== tag) || [];
                                field.onChange(newTags);
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{tag}</span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleDialogClose}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit-food"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
          </Dialog>

          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Enter the name of the new category you want to add.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Category Name</label>
                  <Input 
                    placeholder="e.g. Special Desserts" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (newCategoryName.trim()) {
                      form.setValue("category", newCategoryName.trim());
                      setIsCategoryDialogOpen(false);
                      setNewCategoryName("");
                    }
                  }}
                >
                  Add Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>
                {filteredFoodItems?.length || 0} of {foodItems?.length || 0} items in your menu
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-admin-food"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value)} data-testid="select-sort-food">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                data-testid="button-toggle-sort-food"
                className="w-full sm:w-auto"
              >
                {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
              </Button>
              <Select value={categoryFilter || "none"} onValueChange={(value) => setCategoryFilter(value === "none" ? "" : value)} data-testid="select-category-filter">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">All Categories</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categoryFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCategoryFilter("")}
                  data-testid="button-clear-category-filter"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredFoodItems && filteredFoodItems.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3 max-h-[500px] overflow-y-auto">
                {filteredFoodItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-3 p-3 border border-border rounded-lg"
                    data-testid={`card-food-mobile-${item.id}`}
                  >
                    <div className="w-14 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImagePlus className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <Badge variant="secondary" className="text-xs mt-1">{item.category}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(item)}
                        data-testid={`button-edit-mobile-${item.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(item.id, item.name)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-mobile-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFoodItems.map((item) => (
                      <TableRow key={item.id} data-testid={`row-food-${item.id}`}>
                        <TableCell>
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImagePlus className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                              data-testid={`button-edit-${item.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(item.id, item.name)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : foodItems && foodItems.length > 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No items match your search</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <ImagePlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No food items yet</p>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-item">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Remove Food Item"
        description={`Are you sure you want to remove "${deleteTargetName}" from your menu? This action cannot be undone.`}
        confirmText="Remove"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
