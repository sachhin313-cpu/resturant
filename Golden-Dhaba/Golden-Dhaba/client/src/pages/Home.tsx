import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, UtensilsCrossed, Flame, Clock, MapPin, Utensils } from "lucide-react";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative flex-grow flex items-center justify-center overflow-hidden py-20">
        {/* Premium Background with Gradients */}
        <div className="absolute inset-0 z-0">
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background opacity-80" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          
          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1920&h=1080&fit=crop"
            alt="Delicious Indian Food"
            className="w-full h-full object-cover opacity-25 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/30 to-primary/10 border border-primary/40 px-6 py-3 rounded-full text-primary font-bold text-sm backdrop-blur-xl"
              >
                <Flame className="w-5 h-5" />
                <span>Welcome to Pahasa Mau's Finest Dhaba</span>
              </motion.div>
              
              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="space-y-4"
              >
                <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
                  <span className="text-white drop-shadow-2xl">Punjabi</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent drop-shadow-lg font-black">Restaurant</span>
                </h1>
              </motion.div>
              
              {/* Tagline */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-200 max-w-2xl font-light leading-relaxed"
              >
                "Authentic Veg & Non-Veg <span className="text-primary font-bold">Delicious Taste</span>"
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 pt-6"
              >
                <Link href="/menu" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full h-16 px-10 text-lg font-bold bg-gradient-to-r from-primary to-yellow-400 text-black hover:from-primary hover:to-yellow-300 rounded-xl shadow-[0_0_30px_rgba(240,185,11,0.5)] hover:shadow-[0_0_50px_rgba(240,185,11,0.7)] transition-all hover:-translate-y-2 border-2 border-primary/20"
                  >
                    Order Now <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </Link>
                <Link href="/menu" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full h-16 px-10 text-lg font-bold border-2 border-primary text-primary hover:bg-primary/20 hover:border-primary rounded-xl transition-all hover:-translate-y-1"
                  >
                    <Utensils className="mr-2 w-5 h-5" />
                    View Menu
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Side - Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-full hidden lg:flex items-center justify-center"
            >
              <div className="relative w-full">
                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="absolute top-0 right-0 w-48 h-48"
                >
                  <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(240,185,11,0.3)]">
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                      <Flame className="w-12 h-12 text-primary mb-3" />
                      <p className="text-white font-bold text-lg">Spicy & Hot</p>
                      <p className="text-xs text-muted-foreground">Authentic Flavors</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="absolute bottom-10 left-0 w-48 h-48"
                >
                  <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-400/5 border-yellow-500/30 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,193,7,0.2)]">
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                      <Clock className="w-12 h-12 text-yellow-400 mb-3" />
                      <p className="text-white font-bold text-lg">Quick Delivery</p>
                      <p className="text-xs text-muted-foreground">30 mins or less</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  animate={{ y: [-5, 15, -5] }}
                  transition={{ duration: 7, repeat: Infinity }}
                  className="absolute top-32 left-1/4 w-48 h-48"
                >
                  <Card className="bg-gradient-to-br from-orange-500/20 to-orange-400/5 border-orange-500/30 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,140,0,0.2)]">
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                      <MapPin className="w-12 h-12 text-orange-400 mb-3" />
                      <p className="text-white font-bold text-lg">Local & Fresh</p>
                      <p className="text-xs text-muted-foreground">Pahasa Mau Special</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="font-display text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent">
              Experience the Dhaba Magic
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              We bring the rich, robust, and mouth-watering flavors of traditional Punjabi dhabas straight to your table. Prepared with fresh ingredients and authentic spices.
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: Flame, title: "Authentic Taste", desc: "Traditional recipes from the heart of Punjab", color: "from-primary to-yellow-500" },
              { icon: Clock, title: "Fresh & Quick", desc: "Made fresh daily, delivered in 30 mins", color: "from-yellow-500 to-orange-500" },
              { icon: MapPin, title: "Local Favorite", desc: "Serving Pahasa Mau with love since day one", color: "from-orange-500 to-red-500" },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={item}>
                <Card className="bg-gradient-to-br from-card/50 to-card/20 border-white/10 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(240,185,11,0.2)] group overflow-hidden rounded-2xl h-full">
                  <CardContent className="p-8 flex flex-col items-center text-center h-full space-y-4">
                    <div className={`bg-gradient-to-br ${feature.color} p-4 rounded-xl group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 relative overflow-hidden"
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Ready to Order?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            Browse our delicious menu and get your favorite Punjabi dishes delivered to your doorstep!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/menu">
              <Button 
                size="lg" 
                className="h-16 px-12 text-lg font-bold bg-gradient-to-r from-primary to-yellow-400 text-black hover:from-primary hover:to-yellow-300 rounded-xl shadow-[0_0_30px_rgba(240,185,11,0.5)] hover:shadow-[0_0_50px_rgba(240,185,11,0.7)] transition-all hover:-translate-y-2 border-2 border-primary/20"
              >
                Explore Menu <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
