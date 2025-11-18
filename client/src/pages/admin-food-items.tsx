import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Plus, Pencil, Trash2, ImagePlus } from "lucide-react";
import { insertFoodItemSchema, type FoodItem, type InsertFoodItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import bruschettaImage from "@assets/generated_images/Bruschetta_appetizer_23e7f3dc.png";
import salmonImage from "@assets/generated_images/Grilled_salmon_main_course_20864aa7.png";
import beefImage from "@assets/generated_images/Beef_tenderloin_entree_97bfeb8b.png";
import cakeImage from "@assets/generated_images/Chocolate_lava_cake_dessert_acd92629.png";
import saladImage from "@assets/generated_images/Caesar_salad_7fbcc3e4.png";
import sandwichImage from "@assets/generated_images/Gourmet_finger_sandwiches_5945e4cb.png";

const sampleImages = [
  { url: bruschettaImage, name: "Bruschetta" },
  { url: salmonImage, name: "Salmon" },
  { url: beefImage, name: "Beef" },
  { url: cakeImage, name: "Cake" },
  { url: saladImage, name: "Salad" },
  { url: sandwichImage, name: "Sandwiches" },
];

const categoryMap: Record<string, string> = {
  "appetizer": "Appetizers",
  "main": "Main Courses",
  "dessert": "Desserts",
  "beverage": "Beverages"
};

export default function FoodItemsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const { toast } = useToast();

  const { data: foodItems, isLoading } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const form = useForm<InsertFoodItem>({
    resolver: zodResolver(insertFoodItemSchema.extend({
      price: insertFoodItemSchema.shape.price.refine((val) => val > 0, {
        message: "Price must be greater than 0",
      }),
    })),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "appetizer",
      imageUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertFoodItem) => {
      const priceInCents = Math.round(data.price * 100);
      return apiRequest("POST", "/api/food-items", { ...data, price: priceInCents });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      toast({ title: "Success", description: "Food item created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create food item", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertFoodItem }) => {
      const priceInCents = Math.round(data.price * 100);
      return apiRequest("PATCH", `/api/food-items/${id}`, { ...data, price: priceInCents });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      toast({ title: "Success", description: "Food item updated successfully" });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update food item", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/food-items/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      toast({ title: "Success", description: "Food item deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete food item", variant: "destructive" });
    },
  });

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      description: item.description,
      price: item.price / 100,
      category: item.category,
      imageUrl: item.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this food item?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: InsertFoodItem) => {
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
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Food Items
          </h2>
          <p className="text-muted-foreground">
            Manage your menu items and categories
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-food-item">
              <Plus className="w-4 h-4 mr-2" />
              Add Food Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Food Item" : "Add New Food Item"}
              </DialogTitle>
              <DialogDescription>
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-food-price"
                          />
                        </FormControl>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-food-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="appetizer">Appetizers</SelectItem>
                            <SelectItem value="main">Main Courses</SelectItem>
                            <SelectItem value="dessert">Desserts</SelectItem>
                            <SelectItem value="beverage">Beverages</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (optional)</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Input 
                            placeholder="Enter image URL or select from samples below" 
                            {...field} 
                            data-testid="input-food-image"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            {sampleImages.map((img, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => field.onChange(img.url)}
                                className={`relative aspect-[3/2] rounded-md overflow-hidden border-2 transition-all hover-elevate ${
                                  field.value === img.url ? 'border-primary' : 'border-border'
                                }`}
                                data-testid={`button-sample-image-${idx}`}
                              >
                                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </FormControl>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>
            {foodItems?.length || 0} items in your menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : foodItems && foodItems.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foodItems.map((item) => (
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
                        <Badge variant="secondary">{categoryMap[item.category]}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${(item.price / 100).toFixed(2)}
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
                            onClick={() => handleDelete(item.id)}
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
    </div>
  );
}
