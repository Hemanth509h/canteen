import { useState } from "react";
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
import { Plus, Pencil, Trash2, Star, Search, RefreshCw } from "lucide-react";
import { insertCustomerReviewSchema, updateCustomerReviewSchema, type CustomerReview, type InsertCustomerReview, type UpdateCustomerReview } from "@/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ConfirmDialog } from "@/components/features/confirm-dialog";
import { EmptyState } from "@/components/features/empty-state";
import { PageLoader, TableSkeleton } from "@/components/features/loading-spinner";

const eventTypes = ["Wedding", "Corporate Event", "Birthday Party", "Anniversary", "Engagement", "Conference", "Other"];

const getRatingColor = (ratingumber) => {
  if (rating >= 4) return "default";
  if (rating >= 3) return "secondary";
  return "destructive";
};

export default function ReviewsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const { toast } = useToast();

  const { dataeviews, isLoading, isFetching, refetch } = useQuery<CustomerReview[]>({
    queryKey"/api/reviews"],
  });

  const filteredReviews = reviews?.filter((review) => {
    const matchesSearch = review.customerName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      review.eventType.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      review.comment.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesRating = !ratingFilter || review.rating === parseInt(ratingFilter);
    return matchesSearch && matchesRating;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const form = useForm({
    resolverodResolver(editingReview ? updateCustomerReviewSchema nsertCustomerReviewSchema),
    defaultValues: {
      customerName: "",
      eventType: "Wedding",
      rating: 5,
      comment: "",
    },
  });

  const createMutation = useMutation({
    mutationFnsync (datansertCustomerReview) => {
      return apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: (datany) => {
      queryClient.invalidateQueries({ queryKey"/api/reviews"] });
      toast({ 
        title: "Review Added", 
        description: `Review from ${data.customerName} has been added` 
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (errorny) => {
      toast({ 
        title: "Failed to Add Review", 
        descriptionrror?.message || "Please check that all required fields are filled correctly.",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFnsync ({ id, data }: { idtring; datapdateCustomerReview }) => {
      return apiRequest("PATCH", `/api/reviews/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey"/api/reviews"] });
      toast({ 
        title: "Updated", 
        description: "Review has been updated successfully" 
      });
      setIsDialogOpen(false);
      setEditingReview(null);
      form.reset();
    },
    onError: (errorny) => {
      toast({ 
        title: "Update Failed", 
        descriptionrror?.message || "Unable to update review. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFnsync (idtring) => {
      return apiRequest("DELETE", `/api/reviews/${id}`, undefined);
    },
    onSuccesssync () => {
      await queryClient.invalidateQueries({ queryKey"/api/reviews"], refetchType: 'all' });
      toast({ 
        title: "Removed", 
        description: `Review from ${deleteTargetName} has been removed` 
      });
      setDeleteTargetId(null);
    },
    onError: (errorny) => {
      toast({ 
        title: "Delete Failed", 
        descriptionrror?.message || "Unable to remove this review.",
        variant: "destructive" 
      });
    },
  });

  const handleEdit = (reviewustomerReview) => {
    setEditingReview(review);
    form.reset({
      customerNameeview.customerName,
      eventTypeeview.eventType,
      ratingeview.rating,
      commenteview.comment,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (idtring, nametring) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
    }
  };

  const onSubmit = (datapdateCustomerReview) => {
    if (editingReview) {
      updateMutation.mutate({ idditingReview.id, data });
    } else {
      createMutation.mutate(data as InsertCustomerReview);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingReview(null);
    form.reset();
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold">
              Customer Reviews
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage customer testimonials and ratings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh-reviews"
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
              <Button data-testid="button-add-review">
                <Plus className="w-4 h-4 mr-2" />
                Add Review
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              
                <DialogTitle className="text-lg sm:text-xl">
                  {editingReview ? "Edit Review" : "Add New Review"}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {editingReview ? "Update the review details" : "Add a new customer review"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      
                        Customer Name</FormLabel>
                        
                          <Input placeholder="Enter customer name" {...field} data-testid="input-review-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      
                        Event Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          
                            <SelectTrigger data-testid="select-review-event">
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          
                            {eventTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      
                        Rating (1-5)</FormLabel>
                        <Select onValueChange={(val) => field.onChange(parseInt(val))} value={String(field.value)}>
                          
                            <SelectTrigger data-testid="select-review-rating">
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                          </FormControl>
                          
                            <SelectItem value="1">1 Star - Poor</SelectItem>
                            <SelectItem value="2">2 Stars - Fair</SelectItem>
                            <SelectItem value="3">3 Stars - Good</SelectItem>
                            <SelectItem value="4">4 Stars - Very Good</SelectItem>
                            <SelectItem value="5">5 Stars - Excellent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      
                        Review Comment</FormLabel>
                        
                          <Textarea 
                            placeholder="Enter customer review" 
                            {...field} 
                            data-testid="input-review-comment"
                            rows={4}
                          />
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
                      data-testid="button-submit-review"
                    >
                      {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        
          
            <div className="space-y-4">
              <div>
                Reviews</CardTitle>
                
                  {filteredReviews?.length || 0} of {reviews?.length || 0} reviews
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-reviews"
                  />
                </div>
                <Select value={ratingFilter || "none"} onValueChange={(value) => setRatingFilter(value === "none" ? "" alue)}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by rating" />
                  </SelectTrigger>
                  
                    <SelectItem value="none">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
                {ratingFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRatingFilter("")}
                    data-testid="button-clear-rating-filter"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
            {filteredReviews && filteredReviews.length > 0 ? (
              <div className="space-y-3 overflow-x-auto">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 space-y-2 hover-elevate">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate" data-testid={`text-review-name-${review.id}`}>
                          {review.customerName}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {review.eventType}
                        </p>
                      </div>
                      <Badge variant={getRatingColor(review.rating)} className="whitespace-nowrap" data-testid={`badge-rating-${review.id}`}>
                        {review.rating} <Star className="w-3 h-3 ml-1" fill="currentColor" />
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2 sm:line-clamp-3" data-testid={`text-review-comment-${review.id}`}>
                      {review.comment}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(review)}
                          data-testid={`button-edit-review-${review.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(review.id, review.customerName)}
                          data-testid={`button-delete-review-${review.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Star className="w-12 h-12 mx-auto text-muted-foreground" />}
                title="No reviews yet"
                description="Add your first customer review to get started"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete Review"
        description={`Are you sure you want to delete the review from ${deleteTargetName}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
