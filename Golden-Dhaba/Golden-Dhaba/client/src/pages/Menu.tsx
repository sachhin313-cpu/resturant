import { useState } from "react";
import { useMenu } from "@/hooks/use-menu";
import { useCart } from "@/store/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShoppingBag, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type MenuItem } from "@shared/schema";
import { motion } from "framer-motion";

export default function Menu() {
  const { data: menuItems, isLoading } = useMenu();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<'full' | 'half'>('full');
  const [quantity, setQuantity] = useState(1);

  const openDialog = (item: MenuItem) => {
    setSelectedItem(item);
    setSelectedSize('full');
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;
    
    const price = selectedSize === 'half' && selectedItem.halfPrice 
      ? selectedItem.halfPrice 
      : selectedItem.price;

    addItem({
      menuItemId: selectedItem.id,
      name: selectedItem.name,
      price,
      quantity,
      size: selectedSize,
      imageUrl: selectedItem.imageUrl,
    });

    toast({
      title: "Added to cart",
      description: `${quantity}x ${selectedItem.name} (${selectedSize}) added to your cart.`,
    });
    
    setSelectedItem(null);
  };

  const handleDirectAdd = (item: MenuItem) => {
    if (item.halfPrice) {
      openDialog(item);
    } else {
      addItem({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        size: 'full',
        imageUrl: item.imageUrl,
      });
      toast({
        title: "Added to cart",
        description: `${item.name} added to your cart.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-48 bg-white/10 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card h-80 rounded-2xl border border-white/5"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16 space-y-4">
        <h1 className="font-display text-5xl font-bold text-primary text-glow">Our Menu</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          From fiery chillies to comforting rice, discover our handpicked selection of authentic dishes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuItems?.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-card/50 border-white/10 hover:border-primary/50 transition-all duration-300 overflow-hidden group hover:shadow-gold h-full flex flex-col">
              {/* restaurant menu item dish general */}
              <div className="h-48 overflow-hidden bg-white/5 relative">
                <img 
                  src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop"} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-destructive text-destructive-foreground px-4 py-2 font-bold rounded-lg transform -rotate-12 border-2 border-white/20">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                  <div className="text-right ml-4 shrink-0">
                    <span className="block text-primary font-bold text-lg">₹{item.price}</span>
                    {item.halfPrice && (
                      <span className="block text-xs text-muted-foreground">Half: ₹{item.halfPrice}</span>
                    )}
                  </div>
                </div>
                {item.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-grow">
                    {item.description}
                  </p>
                )}
                
                <Button 
                  className="w-full mt-auto bg-white/5 hover:bg-primary hover:text-primary-foreground border border-white/10 hover:border-primary"
                  onClick={() => handleDirectAdd(item)}
                  disabled={!item.isAvailable}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="bg-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-primary">Add {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="py-6 space-y-8">
            {selectedItem?.halfPrice && (
              <div className="space-y-4">
                <Label className="text-muted-foreground">Select Size</Label>
                <RadioGroup 
                  value={selectedSize} 
                  onValueChange={(val: 'full'|'half') => setSelectedSize(val)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="full" id="full" className="peer sr-only" />
                    <Label
                      htmlFor="full"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-white/10 bg-white/5 p-4 hover:bg-white/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                    >
                      <span className="font-bold text-lg">Full</span>
                      <span className="text-primary font-bold">₹{selectedItem.price}</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="half" id="half" className="peer sr-only" />
                    <Label
                      htmlFor="half"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-white/10 bg-white/5 p-4 hover:bg-white/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                    >
                      <span className="font-bold text-lg">Half</span>
                      <span className="text-primary font-bold">₹{selectedItem.halfPrice}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-muted-foreground">Quantity</Label>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="border-white/10 hover:bg-primary/20 hover:text-primary rounded-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold w-8 text-center">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="border-white/10 hover:bg-primary/20 hover:text-primary rounded-full"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedItem(null)}>Cancel</Button>
            <Button onClick={handleAddToCart} className="bg-primary text-primary-foreground font-bold hover:bg-primary/90">
              Add Item - ₹{(selectedSize === 'half' ? selectedItem?.halfPrice! : selectedItem?.price!) * quantity}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
