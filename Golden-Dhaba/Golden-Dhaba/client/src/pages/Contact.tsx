import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, Instagram, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16 space-y-4">
        <h1 className="font-display text-5xl font-bold text-primary text-glow">Contact Us</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          We'd love to hear from you. Visit us, call us, or follow us on social media.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-white/10 hover:border-primary/50 transition-colors text-center p-6 flex flex-col items-center">
              <div className="bg-primary/20 p-4 rounded-full mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-white mb-2">Location</h3>
              <p className="text-muted-foreground text-sm">Pahasa Mau<br/>Uttar Pradesh, 226208<br/>India</p>
            </Card>

            <Card className="bg-card/50 border-white/10 hover:border-primary/50 transition-colors text-center p-6 flex flex-col items-center">
              <div className="bg-primary/20 p-4 rounded-full mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-white mb-2">Phone</h3>
              <p className="text-muted-foreground text-sm">+91 7408095365<br/>Call for reservations</p>
            </Card>

            <Card className="bg-card/50 border-white/10 hover:border-primary/50 transition-colors text-center p-6 flex flex-col items-center">
              <div className="bg-primary/20 p-4 rounded-full mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-white mb-2">Hours</h3>
              <p className="text-muted-foreground text-sm">Mon-Sun: 11:00 AM - 11:00 PM</p>
            </Card>

            <Card className="bg-card/50 border-white/10 hover:border-primary/50 transition-colors text-center p-6 flex flex-col items-center">
              <div className="bg-primary/20 p-4 rounded-full mb-4">
                <Instagram className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-white mb-2">Instagram</h3>
              <a href="https://instagram.com/punjabi_restorent_0195" target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline">
                @punjabi_restorent_0195
              </a>
            </Card>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <Card className="bg-card border-white/10 overflow-hidden h-full">
            <div className="h-[400px] lg:h-full min-h-[400px] w-full bg-muted relative">
              {/* Google Maps embed for Pahasa Mau */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3556.6662892745753!2d80.90277462342046!3d26.749077977098303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sPahasa%20Mau%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1708942800000" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(80%) contrast(110%)" }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Punjabi Restaurant Location - Pahasa Mau"
              />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
