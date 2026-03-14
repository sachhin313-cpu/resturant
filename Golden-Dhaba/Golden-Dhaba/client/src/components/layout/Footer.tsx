import { Link } from "wouter";
import { Instagram, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-white/5 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-primary">Punjabi Restaurant</h3>
            <p className="text-muted-foreground max-w-xs mx-auto md:mx-0">
              Authentic Veg & Non-Veg delicious Taste. Experience the real flavors of Punjab in Pahasa Mau.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/menu" className="text-muted-foreground hover:text-primary transition-colors">Our Menu</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-foreground">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-center justify-center md:justify-start space-x-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <span>+91 7408095365</span>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Pahasa Mau, Uttar Pradesh, India</span>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-3 text-muted-foreground">
                <Instagram className="w-5 h-5 text-primary" />
                <a href="https://instagram.com/punjabi_restorent_0195" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  @punjabi_restorent_0195
                </a>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Punjabi Restaurant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
