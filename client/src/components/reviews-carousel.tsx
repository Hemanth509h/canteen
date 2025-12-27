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
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const displayReviews = reviews || [];

  useEffect(() => {
    if (displayReviews.length === 0 || !isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayReviews.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [displayReviews.length, isAutoPlay]);

  const nextReview = () => {
    setIsAutoPlay(false);
    if (displayReviews.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % displayReviews.length);
    }
    setTimeout(() => setIsAutoPlay(true), 5000);
  };

  const prevReview = () => {
    setIsAutoPlay(false);
    if (displayReviews.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + displayReviews.length) % displayReviews.length);
    }
    setTimeout(() => setIsAutoPlay(true), 5000);
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
    position = "next",
  }: {
    review: CustomerReview;
    isCurrent?: boolean;
    position?: "prev" | "current" | "next";
  }) => {
    return (
      <Card
        className={`border-none rounded-2xl overflow-hidden transition-all duration-500 review-card-animate ${
          isCurrent
            ? "bg-primary text-primary-foreground shadow-2xl scale-100 md:scale-105"
            : "bg-muted/50 text-foreground shadow-md hover-elevate opacity-75 hover:opacity-90"
        }`}
        style={{
          animation: isCurrent 
            ? "fadeInScaleCenter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            : position === "prev"
              ? "slideInFromLeft 0.6s ease-out forwards"
              : "slideInFromRight 0.6s ease-out forwards"
        }}
      >
        <CardContent className="p-6 md:p-8 flex flex-col h-full">
          {/* Stars with animation */}
          <div 
            className="flex gap-1 mb-6"
            style={{ animation: "fadeInScale 0.5s ease-out 0.1s forwards", opacity: 0 }}
          >
            {[...Array(review.rating)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 fill-current transition-all duration-300 ${
                  isCurrent ? "text-primary-foreground" : "text-primary"
                }`}
              />
            ))}
          </div>

          {/* Comment with animation */}
          <p
            className={`font-light text-lg mb-8 flex-1 leading-relaxed italic ${
              isCurrent ? "text-primary-foreground/90" : "text-muted-foreground"
            }`}
            style={{ animation: "slideInLeftText 0.7s ease-out 0.15s forwards", opacity: 0 }}
          >
            "{review.comment}"
          </p>

          {/* Customer Info with animation */}
          <div
            className={`pt-6 border-t ${
              isCurrent ? "border-primary-foreground/20" : "border-border"
            } space-y-2`}
            style={{ animation: "slideInUpText 0.7s ease-out 0.2s forwards", opacity: 0 }}
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
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <style>{`
        @keyframes fadeInScaleCenter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInLeftText {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInUpText {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleUpDot {
          0% {
            transform: scale(0.5);
          }
          100% {
            transform: scale(1);
          }
        }

        .dot-active {
          animation: scaleUpDot 0.3s ease-out;
        }

        .review-card-animate {
          animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <div className="relative">
        {/* Three Cards Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 px-4 md:px-0">
          {/* Previous Review */}
          <div className="hidden md:block">
            <ReviewCard review={prevReviewData} isCurrent={false} position="prev" />
          </div>

          {/* Current Review */}
          <ReviewCard review={currentReviewData} isCurrent={true} position="current" />

          {/* Next Review */}
          <div className="hidden md:block">
            <ReviewCard review={nextReviewData} isCurrent={false} position="next" />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-center items-center mt-8" style={{ animation: "fadeInScale 0.7s ease-out 0.3s forwards", opacity: 0 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={prevReview}
            className="h-10 w-10 rounded-full border border-border hover-elevate transition-all duration-300 hover:scale-110 active:scale-95"
            data-testid="button-review-prev"
          >
            <ChevronLeft className="w-5 h-5 transition-transform duration-300" />
          </Button>

          {/* Dots */}
          <div className="flex gap-2 items-center">
            {displayReviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsAutoPlay(false);
                  setCurrentIndex(idx);
                  setTimeout(() => setIsAutoPlay(true), 5000);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-8 bg-primary dot-active"
                    : "w-2 bg-border hover:bg-muted-foreground hover:scale-125"
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
            className="h-10 w-10 rounded-full border border-border hover-elevate transition-all duration-300 hover:scale-110 active:scale-95"
            data-testid="button-review-next"
          >
            <ChevronRight className="w-5 h-5 transition-transform duration-300" />
          </Button>
        </div>

        {/* Review Counter */}
        <div className="text-center mt-6 text-sm text-muted-foreground" style={{ animation: "fadeInScale 0.7s ease-out 0.4s forwards", opacity: 0 }}>
          <span className="inline-block transition-all duration-300">{currentIndex + 1}</span>
          <span> of </span>
          <span className="inline-block transition-all duration-300">{displayReviews.length}</span>
          <span> reviews</span>
        </div>
      </div>
    </div>
  );
}
