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
    const getAnimationClass = () => {
      if (isCurrent) {
        return "animate-in fade-in scale-100 zoom-in duration-700";
      }
      return "animate-in fade-in opacity-0 md:opacity-100 duration-700";
    };

    return (
      <div className={`transition-all duration-700 ${getAnimationClass()}`}>
        <Card
          className={`border-none rounded-2xl overflow-hidden transition-all duration-500 ${
            isCurrent
              ? "bg-primary text-primary-foreground shadow-2xl scale-100 md:scale-105"
              : "bg-muted/50 text-foreground shadow-md hover-elevate opacity-75 hover:opacity-90"
          }`}
        >
          <CardContent className="p-6 md:p-8 flex flex-col h-full">
            {/* Stars with animation */}
            <div className="flex gap-1 mb-6 animate-in fade-in slide-in-from-top duration-500 delay-100">
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
              className={`font-light text-lg mb-8 flex-1 leading-relaxed italic animate-in fade-in slide-in-from-left duration-700 delay-150 ${
                isCurrent ? "text-primary-foreground/90" : "text-muted-foreground"
              }`}
            >
              "{review.comment}"
            </p>

            {/* Customer Info with animation */}
            <div
              className={`pt-6 border-t ${
                isCurrent ? "border-primary-foreground/20" : "border-border"
              } space-y-2 animate-in fade-in slide-in-from-bottom duration-700 delay-200`}
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
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }

        .slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }

        .slide-in-up {
          animation: slideInUp 0.6s ease-out forwards;
        }

        .dot-active {
          animation: scaleUp 0.3s ease-out;
        }

        @keyframes scaleUp {
          0% {
            transform: scale(0.5);
          }
          100% {
            transform: scale(1);
          }
        }

        .review-card-enter {
          animation: fadeInScale 0.5s ease-out;
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div className="relative">
        {/* Three Cards Display with stagger animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 px-4 md:px-0">
          {/* Previous Review */}
          <div className="hidden md:block slide-in-left" style={{ animationDelay: "0s" }}>
            <ReviewCard review={prevReviewData} isCurrent={false} position="prev" />
          </div>

          {/* Current Review */}
          <div className="review-card-enter">
            <ReviewCard review={currentReviewData} isCurrent={true} position="current" />
          </div>

          {/* Next Review */}
          <div className="hidden md:block slide-in-right" style={{ animationDelay: "0s" }}>
            <ReviewCard review={nextReviewData} isCurrent={false} position="next" />
          </div>
        </div>

        {/* Navigation Buttons with hover animation */}
        <div className="flex gap-4 justify-center items-center mt-8 animate-in fade-in slide-in-up duration-700 delay-300">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevReview}
            className="h-10 w-10 rounded-full border border-border hover-elevate transition-all duration-300 hover:scale-110 active:scale-95"
            data-testid="button-review-prev"
          >
            <ChevronLeft className="w-5 h-5 transition-transform duration-300" />
          </Button>

          {/* Dots with stagger animation */}
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

        {/* Review Counter with animation */}
        <div className="text-center mt-6 text-sm text-muted-foreground animate-in fade-in duration-700 delay-400">
          <span className="inline-block transition-all duration-300">{currentIndex + 1}</span>
          <span> of </span>
          <span className="inline-block transition-all duration-300">{displayReviews.length}</span>
          <span> reviews</span>
        </div>
      </div>
    </div>
  );
}
