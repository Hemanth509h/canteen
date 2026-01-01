import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

const FoodItemQuickView = ({ item, open, onOpenChange, defaultFoodImage }) => {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-[2rem]">
        <div className="grid md:grid-cols-2">
          <div className="h-64 md:h-full relative">
            <img 
              src={item.imageUrl || defaultFoodImage} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary text-white border-none py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                {item.category}
              </Badge>
            </div>
          </div>
          <div className="p-8 flex flex-col justify-center">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-poppins font-bold text-primary mb-2">
                {item.name}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] uppercase tracking-wider",
                  item.type === "Veg" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {item.type}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-primary" /> 25-30 min
                </span>
              </div>
            </DialogHeader>
            <DialogDescription className="text-lg leading-relaxed mb-8 italic">
              "{item.description}"
            </DialogDescription>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-2xl">
                <ChefHat className="text-primary" size={24} />
                <div>
                  <h4 className="font-bold text-sm">Crafted by Experts</h4>
                  <p className="text-xs text-muted-foreground">Using 100% organic ingredients</p>
                </div>
              </div>
              <Button 
                className="w-full h-14 rounded-2xl text-lg font-bold"
                onClick={() => {
                  document.getElementById('contact-section')?.scrollIntoView({behavior: 'smooth'});
                  onOpenChange(false);
                }}
              >
                Inquire for Event
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodItemQuickView;
