import { useMyOrders } from "@/hooks/use-orders";
import { useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, MapPin, SearchX } from "lucide-react";
import { format } from "date-fns";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered': return 'bg-green-500/20 text-green-500 hover:bg-green-500/30';
    case 'cancelled': return 'bg-destructive/20 text-destructive hover:bg-destructive/30';
    case 'out_for_delivery': return 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30';
    case 'preparing': return 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30';
    default: return 'bg-muted text-muted-foreground'; // pending
  }
};

export default function Dashboard() {
  const { data: user, isLoading: authLoading } = useUser();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();
  const [, setLocation] = useLocation();

  if (authLoading || ordersLoading) return <div className="p-20 text-center text-primary">Loading dashboard...</div>;
  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-primary mb-2">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">Track and manage your recent orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Card className="bg-card border-white/10 sticky top-28">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-white text-xl">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3 space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Order History</h2>
          
          {!orders || orders.length === 0 ? (
            <Card className="bg-card/50 border-dashed border-white/20 p-12 text-center">
              <SearchX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
              <p className="text-muted-foreground">When you place an order, it will appear here.</p>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="bg-card border-white/10 overflow-hidden hover:border-white/20 transition-colors">
                <div className="bg-white/5 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Order #{order.id}</p>
                      <p className="font-bold text-white">₹{order.totalAmount}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-2">
                    <Badge className={`${getStatusColor(order.status)} border-0 px-3 py-1 capitalize`}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(order.createdAt), 'PP p')}
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-6 pb-6 border-b border-white/5">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Items</h4>
                    <ul className="space-y-3">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            <span className="text-white font-medium">{item.quantity}x</span> {item.menuItem?.name || 'Unknown Item'} <span className="text-xs opacity-60">({item.size})</span>
                          </span>
                          <span className="font-medium text-white">₹{item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-primary" /> Delivery Address
                    </h4>
                    <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
