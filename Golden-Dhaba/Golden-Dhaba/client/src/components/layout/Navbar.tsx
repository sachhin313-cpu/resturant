import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/store/use-cart";
import { useUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const itemCount = useCart((state) => state.getItemCount());
  const { data: user } = useUser();
  const logoutMutation = useLogout();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 glass-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-display text-2xl md:text-3xl font-bold text-primary text-glow cursor-pointer">
              Punjabi Dhaba
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.path ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="flex items-center space-x-4 border-l border-white/10 pl-6">
              <Link href="/checkout" className="relative group cursor-pointer">
                <ShoppingCart className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                  </Link>
                  {user.isAdmin && (
                    <Link href="/admin" className="text-sm font-medium text-primary hover:text-primary/80">
                      Admin
                    </Link>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => logoutMutation.mutate()}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-[0_0_15px_rgba(240,185,11,0.3)]">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link href="/checkout" className="relative cursor-pointer">
              <ShoppingCart className="w-6 h-6 text-foreground" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={toggleMenu}
              className="text-foreground hover:text-primary focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={closeMenu}
                  className={`block px-3 py-3 rounded-md text-base font-medium ${
                    location === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-4 mt-4 border-t border-white/10">
                {user ? (
                  <div className="space-y-2">
                    <Link 
                      href="/dashboard" 
                      onClick={closeMenu}
                      className="block px-3 py-3 rounded-md text-base font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    >
                      My Dashboard
                    </Link>
                    {user.isAdmin && (
                      <Link 
                        href="/admin" 
                        onClick={closeMenu}
                        className="block px-3 py-3 rounded-md text-base font-medium text-primary hover:bg-primary/10"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logoutMutation.mutate();
                        closeMenu();
                      }}
                      className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-destructive hover:bg-destructive/10"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link href="/login" onClick={closeMenu}>
                    <Button className="w-full mt-2 bg-primary text-primary-foreground font-bold">
                      Sign In / Register
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
