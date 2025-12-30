import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { insertCustomerReviewSchema } from "@/schema";
import { apiRequest } from "@/lib/queryClient";
import "@/schema";

export default function ReviewForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm({
    resolverodResolver(insertCustomerReviewSchema),
    defaultValues: {
      customerName: "",
      eventType: "",
      rating: 5,
      comment: "",
    },
  });

  const submitMutation = useMutation({
    mutationFnsync (datansertCustomerReview) => {
      return apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Thank you for your review! We appreciate your feedback.",
      });
      form.reset();
      setHoveredRating(0);
      queryClient.invalidateQueries({ queryKey"/api/reviews"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (datansertCustomerReview) => {
    submitMutation.mutate(data);
  };

  return (
    <Card className="border-none bg-muted/30 rounded-2xl shadow-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Share Your Experience</CardTitle>
        Tell us about your event and how we can improve</CardDescription>
      </CardHeader>
      
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Name */}
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                
                  Your Name</FormLabel>
                  
                    <Input placeholder="John Doe" {...field} data-testid="input-review-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Type */}
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                
                  Event Type</FormLabel>
                  
                    <Input placeholder="Wedding, Birthday, Corporate Event..." {...field} data-testid="input-review-event" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                
                  Rating</FormLabel>
                  
                    <div className="flex gap-2" data-testid="select-review-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition-transform hover:scale-110"
                          data-testid={`button-rating-${star}`}
                        >
                          <Star
                            className={`w-8 h-8 transition-all ${
                              star <= (hoveredRating || field.value)
                                ? "fill-primary text-primary"
                                : "text-border"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                
                  Your Review</FormLabel>
                  
                    <Textarea
                      placeholder="Share your experience... (minimum 10 characters)"
                      className="min-h-24 resize-none"
                      {...field}
                      data-testid="textarea-review-comment"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={submitMutation.isPending}
              data-testid="button-submit-review"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
