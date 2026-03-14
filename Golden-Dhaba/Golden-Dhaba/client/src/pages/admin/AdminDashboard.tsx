import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-auth";
import { useAllOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { useMenu, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from "@/hooks/use-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Edit, Plus, Phone, User, Mail, Package, ImageOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { type InsertMenuItem, type MenuItem } from "@shared/schema";

export default function AdminDashboard() {
  const { data: user, isLoading: userLoading } = useUser();
  const [, setLocation] = useLocation();

  if (userLoading) return <div className="p-20 text-center text-primary text-xl">Loading admin panel...</div>;
  if (!user || !user.isAdmin) {
    setLocation("/");
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-white/10">
        <h1 className="font-display text-4xl font-bold text-primary">Admin Control Panel</h1>
        <Badge variant="outline" className="border-primary text-primary">Admin Active</Badge>
      </div>

      <Tabs defaultValue="orders" className="space-y-8">
        <TabsList className="bg-card border border-white/10 h-14 w-full md:w-auto p-1 rounded-xl">
          <TabsTrigger value="orders" className="text-base px-8 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            📦 Orders
          </TabsTrigger>
          <TabsTrigger value="menu" className="text-base px-8 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            🍽️ Menu Items
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrdersManagement />
        </TabsContent>

        <TabsContent value="menu">
          <MenuManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrdersManagement() {
  const { data: orders, isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) return <div className="text-center p-10 text-muted-foreground">Loading orders...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground text-sm">Total Orders: <span className="text-primary font-bold">{orders?.length || 0}</span></p>
      </div>
      <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white font-semibold">Order</TableHead>
                <TableHead className="text-white font-semibold">Customer</TableHead>
                <TableHead className="text-white font-semibold">Items</TableHead>
                <TableHead className="text-white font-semibold">Amount</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-right text-white font-semibold">Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id} className="border-white/10 hover:bg-white/2">
                  {/* Order Info */}
                  <TableCell>
                    <div className="font-bold text-primary text-lg">#{order.id}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 max-w-[160px]" title={order.deliveryAddress}>
                      📍 {order.deliveryAddress}
                    </div>
                    {order.deliveryDistance > 0 && (
                      <div className="text-xs text-muted-foreground">
                        🛵 {order.deliveryDistance} km away
                      </div>
                    )}
                  </TableCell>

                  {/* Customer Details */}
                  <TableCell>
                    <div className="space-y-1 min-w-[160px]">
                      {order.user ? (
                        <>
                          <div className="flex items-center gap-2 text-white font-semibold">
                            <User className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{order.user.name}</span>
                          </div>
                          <a href={`tel:${order.user.phone}`} className="flex items-center gap-2 text-primary hover:underline text-sm">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span>{order.user.phone}</span>
                          </a>
                          <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[130px]">{order.user.email}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-muted-foreground text-sm">User #{order.userId}</div>
                      )}
                    </div>
                  </TableCell>

                  {/* Items ordered */}
                  <TableCell>
                    <div className="space-y-1 min-w-[150px]">
                      {order.items?.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="text-xs text-muted-foreground">
                          • {item.menuItem?.name || 'Item'} × {item.quantity}
                          <span className="text-primary ml-1">({item.size})</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="text-xs text-primary">+{order.items.length - 3} more</div>
                      )}
                    </div>
                  </TableCell>

                  {/* Amount */}
                  <TableCell>
                    <div className="text-primary font-bold text-lg">₹{order.totalAmount}</div>
                    {order.deliveryCharge > 0 && (
                      <div className="text-xs text-muted-foreground">Food: ₹{order.subtotal}</div>
                    )}
                    {order.deliveryCharge > 0 && (
                      <div className="text-xs text-muted-foreground">Delivery: ₹{order.deliveryCharge}</div>
                    )}
                    <div className="mt-1">
                      {order.paymentMethod === "upi" ? (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                          📱 UPI {order.paymentStatus === "paid" ? "✅" : "⏳"}
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                          💵 COD
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <Badge
                      className={`capitalize font-semibold px-3 py-1 ${
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        order.status === 'out_for_delivery' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        order.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-white/10 text-white border-white/20'
                      }`}
                      variant="outline"
                    >
                      {order.status === 'pending' && '⏳ '}
                      {order.status === 'preparing' && '🍳 '}
                      {order.status === 'out_for_delivery' && '🛵 '}
                      {order.status === 'delivered' && '✅ '}
                      {order.status === 'cancelled' && '❌ '}
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>

                  {/* Update Action */}
                  <TableCell className="text-right">
                    <Select
                      defaultValue={order.status}
                      onValueChange={(val) => updateStatus.mutate({ id: order.id, status: val })}
                    >
                      <SelectTrigger className="w-[170px] h-9 ml-auto bg-background border-white/20 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">⏳ Pending</SelectItem>
                        <SelectItem value="preparing">🍳 Preparing</SelectItem>
                        <SelectItem value="out_for_delivery">🛵 Out for Delivery</SelectItem>
                        <SelectItem value="delivered">✅ Delivered</SelectItem>
                        <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {(!orders || orders.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No orders yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function MenuManagement() {
  const { data: menuItems, isLoading } = useMenu();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const defaultFormState: Partial<InsertMenuItem> = {
    name: "",
    description: "",
    price: 0,
    halfPrice: undefined,
    imageUrl: "",
    category: "main",
    isAvailable: true,
  };
  const [formData, setFormData] = useState<Partial<InsertMenuItem>>(defaultFormState);

  const openNewDialog = () => {
    setEditingItem(null);
    setFormData(defaultFormState);
    setImagePreviewError(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price,
      halfPrice: item.halfPrice || undefined,
      imageUrl: item.imageUrl || "",
      category: item.category || "main",
      isAvailable: item.isAvailable,
    });
    setImagePreviewError(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      halfPrice: formData.halfPrice ? Number(formData.halfPrice) : undefined,
      imageUrl: formData.imageUrl?.trim() || undefined,
    } as InsertMenuItem;

    if (editingItem) {
      updateItem.mutate({ id: editingItem.id, ...payload }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({ title: "Item updated!", description: `${payload.name} has been updated.` });
        },
        onError: (err: any) => {
          toast({ title: "Update failed", description: err.message, variant: "destructive" });
        }
      });
    } else {
      createItem.mutate(payload, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({ title: "Item added!", description: `${payload.name} has been added to menu.` });
        },
        onError: (err: any) => {
          toast({ title: "Failed to add item", description: err.message, variant: "destructive" });
        }
      });
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete "${name}" from menu?`)) {
      deleteItem.mutate(id, {
        onSuccess: () => toast({ title: "Item deleted", description: `${name} has been removed.` }),
        onError: () => toast({ title: "Delete failed", variant: "destructive" })
      });
    }
  };

  if (isLoading) return <div className="text-center p-10 text-muted-foreground">Loading menu...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground text-sm">Total Items: <span className="text-primary font-bold">{menuItems?.length || 0}</span></p>
        <Button onClick={openNewDialog} className="bg-primary text-primary-foreground font-bold hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Add New Item
        </Button>
      </div>

      <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10">
              <TableHead className="text-white w-[80px]">Image</TableHead>
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Full / Half Price</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems?.map((item) => (
              <TableRow key={item.id} className="border-white/10">
                <TableCell>
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-xs text-muted-foreground text-center p-1">No Image</span>';
                        }}
                      />
                    ) : (
                      <ImageOff className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-white">{item.name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[220px]">{item.description}</div>
                </TableCell>
                <TableCell className="text-primary font-bold">
                  ₹{item.price}
                  {item.halfPrice ? <span className="text-muted-foreground font-normal text-xs ml-1">/ ₹{item.halfPrice}</span> : ''}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize border-white/20 text-muted-foreground">{item.category}</Badge>
                </TableCell>
                <TableCell>
                  {item.isAvailable ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">✅ Available</Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">❌ Out of Stock</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)} className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.name)} className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-white/10 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-primary">
              {editingItem ? '✏️ Edit Menu Item' : '➕ Add New Item'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Item Name <span className="text-destructive">*</span></Label>
                <Input
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="bg-background border-white/10 focus:border-primary"
                  placeholder="e.g. Paneer Rice"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category || 'main'} onValueChange={(val) => setFormData({...formData, category: val})}>
                  <SelectTrigger className="bg-background border-white/10 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Course</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="noodles">Noodles</SelectItem>
                    <SelectItem value="soup">Soup</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="drink">Drink</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Full Price (₹) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  required
                  min={0}
                  value={formData.price || ''}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="bg-background border-white/10 focus:border-primary"
                  placeholder="e.g. 140"
                />
              </div>

              <div className="space-y-2">
                <Label>Half Price (₹) <span className="text-muted-foreground font-normal text-xs">(Optional)</span></Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.halfPrice || ''}
                  onChange={e => setFormData({...formData, halfPrice: e.target.value ? Number(e.target.value) : undefined})}
                  className="bg-background border-white/10 focus:border-primary"
                  placeholder="e.g. 70"
                />
              </div>
            </div>

            {/* Image URL with Preview */}
            <div className="space-y-2">
              <Label>Image URL <span className="text-muted-foreground font-normal text-xs">(Paste image link here)</span></Label>
              <div className="flex gap-3">
                <Input
                  value={formData.imageUrl || ''}
                  onChange={e => {
                    setFormData({...formData, imageUrl: e.target.value});
                    setImagePreviewError(false);
                  }}
                  className="bg-background border-white/10 focus:border-primary flex-1"
                  placeholder="https://example.com/image.jpg"
                />
                {/* Image Preview */}
                {formData.imageUrl && !imagePreviewError ? (
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreviewError(true)}
                    />
                  </div>
                ) : formData.imageUrl && imagePreviewError ? (
                  <div className="w-16 h-12 rounded-lg border border-destructive/50 bg-destructive/10 flex items-center justify-center shrink-0">
                    <span className="text-destructive text-xs text-center">Bad URL</span>
                  </div>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">Tip: Upload image to <a href="https://imgbb.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">imgbb.com</a> and paste the link here</p>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description || ''}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="bg-background border-white/10 focus:border-primary resize-none"
                rows={2}
                placeholder="Short description of the dish..."
              />
            </div>

            <div className="flex items-center space-x-3 pt-1 bg-white/5 rounded-lg p-4 border border-white/10">
              <Switch
                id="available"
                checked={!!formData.isAvailable}
                onCheckedChange={(c) => setFormData({...formData, isAvailable: c})}
              />
              <div>
                <Label htmlFor="available" className="cursor-pointer font-medium">Currently Available</Label>
                <p className="text-xs text-muted-foreground">Toggle off to mark as out of stock</p>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-white/5 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-muted-foreground">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 px-8"
                disabled={createItem.isPending || updateItem.isPending}
              >
                {createItem.isPending || updateItem.isPending ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
