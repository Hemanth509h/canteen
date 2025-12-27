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
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (displayReviews.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto text-center py-16">
        <p className="text-muted-foreground text-lg">No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  const getPrevIndex = () => (currentIndex - 1 + displayReviews.length) % displayReviews.length;
  const getNextIndex = () => (currentIndex + 1) % displayReviews.length;

  const prevReviewData = displayReviews[getPrevIndex()];
  const currentReviewData = displayReviews[currentIndex];
  const nextReviewData = displayReviews[getNextIndex()];

  const ReviewCard = ({
    review,
    isCurrent = false,
  }: {
    review: CustomerReview;
    isCurrent?: boolean;
  }) => (
    <Card
      className={`border-none rounded-2xl overflow-hidden transition-all duration-300 ${
        isCurrent
          ? "bg-primary text-primary-foreground shadow-2xl scale-100 md:scale-105"
          : "bg-muted/50 text-foreground shadow-md hover-elevate opacity-75"
      }`}
    >
      <CardContent className="p-6 md:p-8 flex flex-col h-full">
        {/* Stars */}
        <div className="flex gap-1 mb-6">
          {[...Array(review.rating)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 fill-current ${
                isCurrent ? "text-primary-foreground" : "text-primary"
              }`}
            />
          ))}
        </div>

        {/* Comment */}
        <p
          className={`font-light text-lg mb-8 flex-1 leading-relaxed italic ${
            isCurrent ? "text-primary-foreground/90" : "text-muted-foreground"
          }`}
        >
          "{review.comment}"
        </p>

        {/* Customer Info */}
        <div
          className={`pt-6 border-t ${
            isCurrent ? "border-primary-foreground/20" : "border-border"
          } space-y-2`}
        >
          <p className={`font-semibold text-base ${isCurrent ? "text-primary-foreground" : "text-foreground"}`}>
            {review.customerName}
          </p>
          <p className={`text-sm font-medium ${isCurrent ? "text-primary-foreground/80" : "text-primary"}`}>
            {review.eventType}
          </p>
          <p
            className={`text-xs ${
              isCurrent ? "text-primary-foreground/60" : "text-muted-foreground"
            }`}
          >
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="relative">
        {/* Three Cards Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 px-4 md:px-0">
          {/* Previous Review */}
          <div className="hidden md:block">
            <ReviewCard review={prevReviewData} isCurrent={false} />
          </div>

          {/* Current Review */}
          <ReviewCard review={currentReviewData} isCurrent={true} />

          {/* Next Review */}
          <div className="hidden md:block">
            <ReviewCard review={nextReviewData} isCurrent={false} />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-center items-center mt-8">
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
