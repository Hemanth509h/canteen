import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ImagePlus, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function HeroImagesManager() {
  const { toast } = useToast();
  const [newImageUrl, setNewImageUrl] = useState("");

  const { data: companyInfo, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["/api/company-info"],
  });

  const heroImages = companyInfo?.heroImages || [
    "/images/luxury_indian_wedding_buffet_setup.png",
    "/images/gourmet_indian_food_platter_biryani_thali.png",
    "/images/indian_event_catering_dessert_station.png",
    "/images/elegant_indian_dining_table_arrangement.png"
  ];

  const updateMutation = useMutation({
    mutationFn: async (newImages) => {
      return apiRequest("PATCH", "/api/company-info", { heroImages: newImages });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-info"] });
      toast({ title: "Updated", description: "Hero images updated successfully" });
      setNewImageUrl("");
    },
  });

  const addImage = () => {
    if (!newImageUrl) return;
    updateMutation.mutate([...heroImages, newImageUrl]);
  };

  const removeImage = (index) => {
    const newImages = heroImages.filter((_, i) => i !== index);
    updateMutation.mutate(newImages);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <ImagePlus className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold">Hero Images</h2>
          <p className="text-sm text-muted-foreground">Manage homepage background slider images</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Image</CardTitle>
          <CardDescription>Enter the URL for a new hero image</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="https://example.com/image.jpg" 
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />
            <Button onClick={addImage} disabled={updateMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {heroImages.map((url, index) => (
          <Card key={index} className="overflow-hidden group">
            <div className="aspect-video relative">
              <img src={url} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => removeImage(index)}
                  disabled={updateMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-2 truncate text-xs text-muted-foreground">
              {url}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
