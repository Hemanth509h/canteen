import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewsCarousel({ reviews = [], isLoading }) {
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
  }) => {
    const animationName = isCurrent 
      ? "cardFadeInScale"
      osition === "prev"
        ? "cardSlideInLeft"
        : "cardSlideInRight";

    return (
      <div
        className={`border-none rounded-2xl overflow-hidden ${
          isCurrent
            ? "bg-primary text-primary-foreground shadow-2xl"
            : "bg-muted/50 text-foreground shadow-md hover-elevate"
        }`}
        style={{
          animation: `${animationName} 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
          opacity: 0,
          transform: isCurrent ? "scale(1)" : "scale(1)",
        }}
      >
        <div className={`relative p-6 md:p-8 flex flex-col h-full min-h-80 transition-all duration-500 ${
          isCurrent ? "md:scale-105" : "opacity-75 hover:opacity-90"
        }`}>
          {/* Background gradient animation */}
          <div className="absolute inset-0 -z-10">
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundsCurrent
                  ? "radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent)"
                  : "radial-gradient(circle at bottom left, rgba(0,0,0,0.05), transparent)",
                animationsCurrent ? "bgPulse 3s ease-in-out infinite" : "none",
              }}
            />
          </div>

          {/* Stars with animation */}
          <div 
            className="flex gap-1 mb-6"
            style={{
              animation: "contentFadeIn 0.6s ease-out 0.15s forwards",
              opacity: 0,
            }}
          >
            {[...Array(review.rating)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 fill-current transition-all duration-300 ${
                  isCurrent ? "text-primary-foreground" : "text-primary"
                }`}
                style={{
                  animation: `starBounce 0.6s ease-out ${0.2 + i * 0.1}s forwards`,
                  opacity: 0,
                }}
              />
            ))}
          </div>

          {/* Comment with animation */}
          <p
            className={`font-light text-lg mb-8 flex-1 leading-relaxed italic ${
              isCurrent ? "text-primary-foreground/90" : "text-muted-foreground"
            }`}
            style={{
              animation: "contentSlideInLeft 0.7s ease-out 0.2s forwards",
              opacity: 0,
            }}
          >
            "{review.comment}"
          </p>

          {/* Customer Info with animation */}
          <div
            className={`pt-6 border-t ${
              isCurrent ? "border-primary-foreground/20" : "border-border"
            } space-y-2`}
            style={{
              animation: "contentSlideInUp 0.7s ease-out 0.25s forwards",
              opacity: 0,
            }}
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
              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <style>{`
        /* Card entrance animations */
        @keyframes cardFadeInScale {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes cardSlideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes cardSlideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Content animations */
        @keyframes contentFadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes contentSlideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes contentSlideInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes starBounce {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Background animations */
        @keyframes bgPulse {
          0%, 100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes bgGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.15);
          }
        }

        /* Navigation animations */
        @keyframes navFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes counterFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes dotPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        .nav-container {
          animation: navFadeIn 0.6s ease-out 0.35s forwards;
          opacity: 0;
        }

        .counter-text {
          animation: counterFadeIn 0.6s ease-out 0.4s forwards;
          opacity: 0;
        }

        .dot-active {
          animation: dotPulse 0.4s ease-out;
        }
      `}</style>

      <div className="relative">
        {/* Three Cards Display with full animations */}
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

        {/* Navigation Controls with animation */}
        <div className="nav-container flex gap-4 justify-center items-center mt-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevReview}
            className="h-10 w-10 rounded-full border border-border hover-elevate transition-all duration-300 hover:scale-110 active:scale-95"
            data-testid="button-review-prev"
          >
            <ChevronLeft className="w-5 h-5 transition-transform duration-300" />
          </Button>

          {/* Dots with animation */}
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

        {/* Counter with animation */}
        <div className="counter-text text-center mt-6 text-sm text-muted-foreground">
          <span className="inline-block transition-all duration-300 font-semibold">{currentIndex + 1}</span>
          <span> of </span>
          <span className="inline-block transition-all duration-300 font-semibold">{displayReviews.length}</span>
          <span> reviews</span>
        </div>
      </div>
    </div>
  );
}
