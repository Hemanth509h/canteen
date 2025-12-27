import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CustomerReview } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewsCarouselProps {
  reviews: CustomerReview[] | undefined;
  isLoading: boolean;
}

export default function ReviewsCarousel({ reviews = [], isLoading }: ReviewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayReviews = reviews || [];

  useEffect(() => {
    if (displayReviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayReviews.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [displayReviews.length]);

  const nextReview = () => {
    if (displayReviews.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % displayReviews.length);
    }
  };

  const prevReview = () => {
    if (displayReviews.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + displayReviews.length) % displayReviews.length);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (displayReviews.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto text-center py-16">
        <p className="text-muted-foreground text-lg">No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  const currentReview = displayReviews[currentIndex];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="relative">
        {/* Main Review Card */}
        <Card className="border-none bg-background hover-elevate transition-all duration-300 rounded-2xl overflow-hidden shadow-lg">
          <CardContent className="p-12 md:p-16 flex flex-col h-full">
            {/* Stars */}
            <div className="flex gap-1 mb-8">
              {[...Array(currentReview.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>

            {/* Comment */}
            <p className="text-muted-foreground font-light text-xl mb-10 flex-1 leading-relaxed italic">
              "{currentReview.comment}"
            </p>

            {/* Customer Info */}
            <div className="pt-8 border-t border-border space-y-2">
              <p className="font-semibold text-lg text-foreground">{currentReview.customerName}</p>
              <p className="text-sm text-primary font-medium">{currentReview.eventType}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(currentReview.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevReview}
            className="h-10 w-10 rounded-full border border-border hover-elevate"
            data-testid="button-review-prev"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Dots */}
          <div className="flex gap-2 items-center">
            {displayReviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground"
                }`}
                aria-label={`Go to review ${idx + 1}`}
                data-testid={`button-review-dot-${idx}`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextReview}
            className="h-10 w-10 rounded-full border border-border hover-elevate"
            data-testid="button-review-next"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Review Counter */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          {currentIndex + 1} of {displayReviews.length} reviews
        </div>
      </div>
    </div>
  );
}
