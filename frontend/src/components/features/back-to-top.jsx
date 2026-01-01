import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NavigationButton = () => {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = document.documentElement.scrollTop;
      setAtTop(scrolled < 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToPosition = () => {
    if (atTop) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Button
      variant="primary"
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 z-[90] rounded-full shadow-2xl transition-all duration-300",
        "opacity-100 translate-y-0"
      )}
      onClick={scrollToPosition}
      title={atTop ? "Go to Bottom" : "Back to Top"}
    >
      {atTop ? <ArrowDown size={24} /> : <ArrowUp size={24} />}
    </Button>
  );
};

export default NavigationButton;
