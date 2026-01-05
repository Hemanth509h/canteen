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

const FoodItemQuickView = ({ item, onClose, defaultFoodImage }) => {
  if (!item) return null;

  return (
    <div className="grid md:grid-cols-2 bg-card">
      <div className="h-64 md:h-full relative">
        <img 
          src={item.imageUrl || "https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=600&auto=format&fit=crop"} 
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=600&auto=format&fit=crop';
          }}
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary text-white border-none py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
            {item.category}
          </Badge>
        </div>
      </div>
      <div className="p-8 flex flex-col justify-center bg-card text-card-foreground">
        <div className="mb-6">
          <h3 className="text-3xl font-poppins font-bold text-primary mb-2">
            {item.name}
          </h3>
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
        </div>
        <p className="text-lg leading-relaxed mb-8 italic text-muted-foreground">
          "{item.description}"
        </p>
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
              onClose();
            }}
          >
            Inquire for Event
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodItemQuickView;
