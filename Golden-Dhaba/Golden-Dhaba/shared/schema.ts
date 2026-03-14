import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Full price in Rupees
  halfPrice: integer("half_price"), // Half price in Rupees (optional)
  imageUrl: text("image_url"),
  category: text("category").default('main'),
  isAvailable: boolean("is_available").default(true).notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, preparing, out_for_delivery, delivered, cancelled
  subtotal: integer("subtotal").notNull(),
  deliveryCharge: integer("delivery_charge").notNull().default(0),
  totalAmount: integer("total_amount").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryDistance: integer("delivery_distance").notNull().default(0), // in km
  paymentMethod: text("payment_method").notNull().default("cod"), // cod or upi
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  menuItemId: integer("menu_item_id").notNull(),
  quantity: integer("quantity").notNull(),
  size: text("size").notNull().default("full"), // 'full' or 'half'
  price: integer("price").notNull(), // price per item at the time of order
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, isAdmin: true });
export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// API Contracts
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const checkoutSchema = z.object({
  deliveryAddress: z.string().min(5),
  deliveryDistance: z.number().min(0).max(100),
  paymentMethod: z.enum(["cod", "upi"]).default("cod"),
  items: z.array(z.object({
    menuItemId: z.number(),
    quantity: z.number().min(1),
    size: z.enum(["full", "half"]),
  })).min(1),
});

export type CheckoutRequest = z.infer<typeof checkoutSchema>;
