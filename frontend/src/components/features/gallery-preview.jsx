import { Instagram, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

const GalleryPreview = () => {
  const images = [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531058021387-32305b0c83d7?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470753012982-7f9894753f17?q=80&w=800&auto=format&fit=crop"
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Memories</span>
            <h2 className="text-4xl md:text-6xl font-poppins font-bold">Event Gallery</h2>
            <p className="text-muted-foreground mt-4 italic">A glimpse into the extraordinary experiences we've helped create.</p>
          </div>
          <Button variant="outline" className="rounded-full gap-2 group">
            View All Photos <Camera size={18} className="group-hover:rotate-12 transition-transform" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {images.map((src, idx) => (
            <div key={idx} className="aspect-square rounded-2xl overflow-hidden group relative">
              <img 
                src={src} 
                alt={`Gallery image ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram size={24} className="text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GalleryPreview;
