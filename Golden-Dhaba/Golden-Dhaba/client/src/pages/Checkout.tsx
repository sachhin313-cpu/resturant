import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useCart } from "@/store/use-cart";
import { useUser } from "@/hooks/use-auth";
import { useCreateOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, ArrowLeft, ArrowRight, Minus, Plus, CheckCircle2, Smartphone, Banknote, Copy, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { getRestaurantTimingStatus, type TimingStatus } from "@shared/timing";

const UPI_ID = "tg-j91inks@ptaxis";
const UPI_NAME = "Punjabi+Restaurant";

function getUpiUrl(amount: number) {
  return `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${amount}&cu=INR&tn=Food+Order+Punjabi+Restaurant`;
}

const STORAGE_KEY = (userId: number) => `punjabi_delivery_${userId}`;

type SavedLocation = { address: string; distance: number };

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const { data: user, isLoading: authLoading } = useUser();
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  // Live restaurant timing status — refreshes every 30 seconds
  const [timing, setTiming] = useState<TimingStatus>(getRestaurantTimingStatus());
  useEffect(() => {
    const interval = setInterval(() => {
      setTiming(getRestaurantTimingStatus());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Saved address from previous order
  const savedLocation: SavedLocation | null = user
    ? JSON.parse(localStorage.getItem(STORAGE_KEY(user.id)) || "null")
    : null;

  // If saved address exists, start with it pre-filled; user can switch to new
  const [useNewAddress, setUseNewAddress] = useState(!savedLocation);
  const [address, setAddress] = useState(savedLocation?.address || "");
  const [distance, setDistance] = useState(savedLocation?.distance || 0);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi">("cod");
  const [showUpiDialog, setShowUpiDialog] = useState(false);
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(false);

  const subtotal = getTotal();

  const calculateDeliveryCharge = (dist: number) => {
    if (dist <= 3) return 40;
    if (dist <= 7) return 70;
    if (dist <= 15) return 120;
    return 150;
  };

  const effectiveAddress = useNewAddress ? address : (savedLocation?.address || address);
  const effectiveDistance = useNewAddress ? distance : (savedLocation?.distance || distance);
  const deliveryCharge = calculateDeliveryCharge(effectiveDistance);
  const total = subtotal + deliveryCharge;

  const switchToNewAddress = () => {
    setAddress("");
    setDistance(0);
    setUseNewAddress(true);
  };

  const useSavedAddress = () => {
    if (savedLocation) {
      setAddress(savedLocation.address);
      setDistance(savedLocation.distance);
      setUseNewAddress(false);
    }
  };

  const validateForm = () => {
    if (!user) {
      toast({ title: "Login required", description: "Please login to place an order", variant: "destructive" });
      setLocation("/login");
      return false;
    }
    if (effectiveAddress.length < 5) {
      toast({ title: "Address required", description: "Please enter a valid delivery address", variant: "destructive" });
      return false;
    }
    if (effectiveDistance <= 0) {
      toast({ title: "Distance required", description: "Please enter delivery distance in km", variant: "destructive" });
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    try {
      setPendingOrder(true);
      const order = await createOrder.mutateAsync({
        deliveryAddress: effectiveAddress,
        deliveryDistance: effectiveDistance,
        paymentMethod,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          size: item.size,
        }))
      });
      // Save this delivery location for next time
      if (user) {
        localStorage.setItem(STORAGE_KEY(user.id), JSON.stringify({
          address: effectiveAddress,
          distance: effectiveDistance,
        }));
      }
      clearCart();
      setShowUpiDialog(false);
      toast({
        title: paymentMethod === "upi" ? "✅ Order Placed & Payment Confirmed!" : "✅ Order Placed!",
        description: "Order details sent to restaurant on WhatsApp.",
      });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Failed to place order", description: err.message, variant: "destructive" });
    } finally {
      setPendingOrder(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!validateForm()) return;
    if (paymentMethod === "upi") {
      setShowUpiDialog(true);
    } else {
      placeOrder();
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast({ title: "UPI ID Copied!", description: UPI_ID });
  };

  if (authLoading) return <div className="p-20 text-center text-primary">Loading...</div>;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <h1 className="font-display text-4xl font-bold text-white">Your Cart is Empty</h1>
        <p className="text-muted-foreground text-lg">Looks like you haven't added any delicious items yet.</p>
        <Link href="/menu">
          <Button size="lg" className="bg-primary text-primary-foreground font-bold mt-4">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/menu" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Menu
      </Link>

      <h1 className="font-display text-4xl font-bold text-primary mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-card/50 border-white/5 overflow-hidden">
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-white/5 border border-white/10 hidden sm:block">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="font-bold text-lg text-white">{item.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">Size: {item.size}</p>
                    <p className="text-primary font-bold mt-1">₹{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-white/5 rounded-lg border border-white/10 p-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-primary rounded-md" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center font-medium">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-primary rounded-md" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-right w-20 font-bold hidden sm:block">₹{item.price * item.quantity}</div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Order Summary & Form */}
        <div className="space-y-6">
          {/* Restaurant Status Banner */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border px-4 py-3 flex items-start gap-3 ${
              timing.isOpen
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            {timing.isOpen ? (
              <Clock className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold text-sm ${timing.isOpen ? "text-green-400" : "text-red-400"}`}>
                {timing.isOpen ? "🟢 Restaurant Open" : "🔴 Restaurant Closed"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{timing.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Orders: <span className="text-white font-medium">{timing.orderStartsAt}</span> – <span className="text-white font-medium">{timing.orderEndsAt}</span>
              </p>
            </div>
          </motion.div>

          <Card className="bg-card border-white/10 shadow-gold sticky top-28">
            <CardHeader className="border-b border-white/5 pb-6">
              <CardTitle className="font-display text-2xl text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery ({distance > 0 ? `${distance}km` : '?'})</span>
                  <span className="text-primary">₹{deliveryCharge}</span>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                  <span className="font-bold text-xl text-white">Total</span>
                  <span className="font-bold text-2xl text-primary font-display">₹{total}</span>
                </div>
              </div>

              {!user ? (
                <div className="pt-2 bg-primary/5 p-4 rounded-xl border border-primary/20">
                  <p className="text-sm text-center mb-4">Please login to place your order</p>
                  <Link href="/login">
                    <Button className="w-full bg-primary text-primary-foreground font-bold">Login to Continue</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Delivery Location */}
                  <div className="space-y-3">
                    <Label>Delivery Location</Label>

                    {/* Saved address card */}
                    {savedLocation && !useNewAddress && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-primary/5 border-2 border-primary/30 rounded-xl p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="text-lg mt-0.5">📍</span>
                            <div>
                              <p className="text-xs text-primary font-semibold mb-1">Saved Address</p>
                              <p className="text-sm text-white leading-snug">{savedLocation.address}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Distance: <span className="text-primary font-medium">{savedLocation.distance} km</span>
                                &nbsp;• Delivery: <span className="text-primary font-medium">₹{deliveryCharge}</span>
                              </p>
                            </div>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        </div>
                        <button
                          type="button"
                          onClick={switchToNewAddress}
                          className="w-full text-xs text-muted-foreground hover:text-white border border-white/10 hover:border-white/30 rounded-lg py-2 transition-all mt-1"
                        >
                          🏠 Use a different address
                        </button>
                      </motion.div>
                    )}

                    {/* New address form */}
                    {useNewAddress && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          required
                          value={distance || ""}
                          onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                          className="bg-background border-white/10 focus:border-primary"
                          placeholder="Distance in km (e.g. 5)"
                        />
                        <p className="text-xs text-muted-foreground -mt-1">₹40 (0-3km) • ₹70 (3-7km) • ₹120 (7-15km) • ₹150 (15+km)</p>
                        <Textarea
                          placeholder="Full delivery address..."
                          className="bg-background border-white/10 focus:border-primary resize-none"
                          rows={3}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                        {/* Back to saved */}
                        {savedLocation && (
                          <button
                            type="button"
                            onClick={useSavedAddress}
                            className="w-full text-xs text-primary hover:text-primary/80 border border-primary/20 hover:border-primary/40 rounded-lg py-2 transition-all"
                          >
                            ← Use my saved address instead
                          </button>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3">
                    <Label>Payment Method</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Cash on Delivery */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cod")}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === "cod"
                            ? "border-primary bg-primary/10"
                            : "border-white/10 bg-white/5 hover:border-white/30"
                        }`}
                      >
                        <Banknote className={`w-6 h-6 ${paymentMethod === "cod" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-semibold ${paymentMethod === "cod" ? "text-primary" : "text-muted-foreground"}`}>
                          Cash on Delivery
                        </span>
                        {paymentMethod === "cod" && (
                          <CheckCircle2 className="w-4 h-4 text-primary absolute top-2 right-2" />
                        )}
                      </button>

                      {/* UPI */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("upi")}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === "upi"
                            ? "border-primary bg-primary/10"
                            : "border-white/10 bg-white/5 hover:border-white/30"
                        }`}
                      >
                        <Smartphone className={`w-6 h-6 ${paymentMethod === "upi" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-semibold ${paymentMethod === "upi" ? "text-primary" : "text-muted-foreground"}`}>
                          Pay via UPI
                        </span>
                        {paymentMethod === "upi" && (
                          <CheckCircle2 className="w-4 h-4 text-primary absolute top-2 right-2" />
                        )}
                        <div className="flex gap-1 mt-1">
                          {["G", "P", "T"].map((app) => (
                            <span key={app} className="text-[9px] bg-white/10 rounded px-1 text-muted-foreground">{app}</span>
                          ))}
                        </div>
                      </button>
                    </div>

                    {/* UPI Info strip */}
                    <AnimatePresence>
                      {paymentMethod === "upi" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3"
                        >
                          <p className="text-xs text-muted-foreground">
                            📱 QR code & payment screen will appear after clicking <b className="text-primary">Place Order</b>
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Place Order Button */}
                  {!timing.isOpen ? (
                    <div className="w-full h-14 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-semibold text-sm">Restaurant abhi closed hai</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full h-14 text-lg bg-primary text-primary-foreground font-bold shadow-[0_0_15px_rgba(240,185,11,0.3)] hover:shadow-[0_0_25px_rgba(240,185,11,0.5)] transition-all"
                      onClick={handlePlaceOrder}
                      disabled={createOrder.isPending || pendingOrder}
                    >
                      {createOrder.isPending || pendingOrder ? "Processing..." : (
                        <>
                          {paymentMethod === "upi" ? "Proceed to Pay" : "Place Order"}
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* UPI Payment Dialog */}
      <Dialog open={showUpiDialog} onOpenChange={setShowUpiDialog}>
        <DialogContent className="bg-card border-white/10 max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-primary text-center">
              💳 Pay via UPI
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Amount */}
            <div className="text-center bg-primary/10 border border-primary/30 rounded-2xl py-4">
              <p className="text-muted-foreground text-sm mb-1">Total Amount</p>
              <p className="font-display text-4xl font-bold text-primary">₹{total}</p>
            </div>

            {/* QR Code — generated locally for exact order amount */}
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-4 rounded-2xl shadow-gold">
                <QRCodeSVG
                  value={getUpiUrl(total)}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan with any UPI app — GPay, PhonePe, Paytm, BHIM
              </p>
            </div>

            {/* UPI ID */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">UPI ID</p>
                <p className="font-mono font-bold text-white text-sm">{UPI_ID}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={copyUpiId} className="shrink-0 hover:text-primary">
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Pay Buttons */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">Or pay directly via app</p>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`tez://upi/pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${total}&cu=INR&tn=Food+Order`}
                  className="flex flex-col items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 transition-all"
                >
                  <span className="text-lg">G</span>
                  <span className="text-xs text-muted-foreground">GPay</span>
                </a>
                <a
                  href={`phonepe://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${total}&cu=INR`}
                  className="flex flex-col items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 transition-all"
                >
                  <span className="text-lg">P</span>
                  <span className="text-xs text-muted-foreground">PhonePe</span>
                </a>
                <a
                  href={`paytmmp://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${total}&cu=INR`}
                  className="flex flex-col items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 transition-all"
                >
                  <span className="text-lg">T</span>
                  <span className="text-xs text-muted-foreground">Paytm</span>
                </a>
              </div>
            </div>

            {/* Confirmation checkbox */}
            <div
              onClick={() => setUpiConfirmed(!upiConfirmed)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                upiConfirmed
                  ? "border-green-500 bg-green-500/10"
                  : "border-white/20 bg-white/5 hover:border-white/40"
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${upiConfirmed ? "border-green-500 bg-green-500" : "border-white/30"}`}>
                {upiConfirmed && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <p className="text-sm text-white font-medium">
                I have completed the UPI payment of <span className="text-primary font-bold">₹{total}</span>
              </p>
            </div>

            {/* Confirm Order Button */}
            <Button
              className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-500 text-white transition-all"
              disabled={!upiConfirmed || pendingOrder || createOrder.isPending}
              onClick={placeOrder}
            >
              {pendingOrder || createOrder.isPending ? "Confirming..." : "✅ Confirm & Place Order"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Please complete payment before confirming. Order will be processed immediately.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
