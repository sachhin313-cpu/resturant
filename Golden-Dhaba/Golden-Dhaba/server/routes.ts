import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import memorystore from "memorystore";
import { getRestaurantTimingStatus } from "@shared/timing";

const ADMIN_WHATSAPP = "918081830831";

async function sendWhatsAppToAdmin(message: string) {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey) {
    console.log("[WhatsApp] CALLMEBOT_API_KEY not set — skipping notification");
    return;
  }
  try {
    const encoded = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${ADMIN_WHATSAPP}&text=${encoded}&apikey=${apiKey}`;
    const res = await fetch(url);
    const text = await res.text();
    console.log("[WhatsApp] Notification sent:", text.substring(0, 80));
  } catch (err) {
    console.error("[WhatsApp] Failed to send notification:", err);
  }
}

const MemoryStore = memorystore(session);

// Extending express session to include userId
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

async function seedDatabase() {
  try {
    const items = await storage.getMenuItems();
    if (items.length === 0) {
      await storage.createMenuItem({
        name: "Paneer Rice",
        description: "Delicious rice tossed with fresh paneer cubes and spices.",
        price: 140,
        halfPrice: 70,
        category: "rice",
        imageUrl: "https://images.unsplash.com/photo-1504674900967-ab3cba666e7d?w=600&h=400&fit=crop",
      });
      await storage.createMenuItem({
        name: "Paneer Chilli",
        description: "Spicy and tangy paneer tossed with bell peppers.",
        price: 200,
        halfPrice: 100,
        category: "starter",
        imageUrl: "https://images.unsplash.com/photo-1594929181889-439199dc1e48?w=600&h=400&fit=crop",
      });
      await storage.createMenuItem({
        name: "Manchurian Rice",
        description: "Fried rice with veg manchurian gravy mixed.",
        price: 100,
        halfPrice: 50,
        category: "rice",
        imageUrl: "https://images.unsplash.com/photo-1582609921212-a36c3180042a?w=600&h=400&fit=crop",
      });
      await storage.createMenuItem({
        name: "Manchurian Gravy",
        description: "Classic vegetable manchurian balls in thick gravy.",
        price: 40,
        category: "main",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
      });
      await storage.createMenuItem({
        name: "Veg Manchurian",
        description: "Crispy veg manchurian dry starter.",
        price: 60,
        halfPrice: 30,
        category: "starter",
        imageUrl: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=600&h=400&fit=crop",
      });
      await storage.createMenuItem({
        name: "Manchurian Soup",
        description: "Hot and sour manchurian flavor soup.",
        price: 50,
        halfPrice: 25,
        category: "soup",
        imageUrl: "https://images.unsplash.com/photo-1476124369162-f4978a2a9200?w=600&h=400&fit=crop",
      });
      await storage.createMenuItem({
        name: "Veg Schezwan Fried Rice",
        description: "Spicy schezwan fried rice with fresh veggies.",
        price: 80,
        halfPrice: 40,
        category: "rice",
        imageUrl: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=600&h=400&fit=crop",
      });
      await storage.createMenuItem({
        name: "Veg Schezwan Noodles",
        description: "Spicy schezwan noodles tossed with veggies.",
        price: 60,
        halfPrice: 30,
        category: "noodles",
        imageUrl: "https://images.unsplash.com/photo-1585335278367-ea1b1e6a09b6?w=600&h=400&fit=crop",
      });
      await storage.createMenuItem({
        name: "Paneer Noodles",
        description: "Noodles tossed with soft paneer cubes.",
        price: 100,
        halfPrice: 50,
        category: "noodles",
        imageUrl: "https://images.unsplash.com/photo-1621996346565-a3a5ad3e3bab?w=600&h=400&fit=crop",
      });

      // Create an admin user
      await storage.createUser({
        email: "admin@punjabi.com",
        password: "admin", // simple for demo
        name: "Admin",
        phone: "7408095365"
      });
      
      // Update the user to admin manually as insert schema omits isAdmin
      const adminUser = await storage.getUserByEmail("admin@punjabi.com");
      if (adminUser) {
        const { db } = await import("./db");
        const { users } = await import("@shared/schema");
        const { eq } = await import("drizzle-orm");
        await db.update(users).set({ isAdmin: true }).where(eq(users.id, adminUser.id));
      }
      
      console.log("Database seeded successfully.");
    }
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup session store
  app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'punjabi_restaurant_secret',
  }));

  // Helper middleware for auth
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(401).json({ message: "Admin access required" });
    }
    next();
  };

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existingUser = await storage.getUserByEmail(input.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use", field: "email" });
      }
      const user = await storage.createUser(input);
      req.session.userId = user.id;
      
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      if (!user || user.password !== input.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.session.userId = user.id;
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get(api.auth.me.path, requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  });

  // Menu Routes
  app.get(api.menu.list.path, async (req, res) => {
    const items = await storage.getMenuItems();
    res.status(200).json(items);
  });

  app.post(api.menu.create.path, requireAdmin, async (req, res) => {
    try {
      // Convert empty string imageUrl to null
      const body = {
        ...req.body,
        imageUrl: req.body.imageUrl?.trim() || null,
        halfPrice: req.body.halfPrice ? Number(req.body.halfPrice) : null,
      };
      const input = api.menu.create.input.parse(body);
      const item = await storage.createMenuItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        console.error("Create menu item error:", err);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put(api.menu.update.path, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      // Convert empty string imageUrl to null
      const body = {
        ...req.body,
        imageUrl: req.body.imageUrl?.trim() || null,
        halfPrice: req.body.halfPrice ? Number(req.body.halfPrice) : null,
      };
      const input = api.menu.update.input.parse(body);
      const item = await storage.updateMenuItem(id, input);
      if (!item) return res.status(404).json({ message: "Menu item not found" });
      res.status(200).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.menu.delete.path, requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await storage.deleteMenuItem(id);
    res.status(204).send();
  });

  // Orders Routes
  app.post(api.orders.create.path, requireAuth, async (req, res) => {
    try {
      // Check restaurant timing before accepting order
      const timing = getRestaurantTimingStatus();
      if (!timing.isOpen) {
        return res.status(403).json({ message: timing.message });
      }

      const input = api.orders.create.input.parse(req.body);
      let subtotal = 0;
      const orderItems = [];

      for (const item of input.items) {
        const menuItem = await storage.getMenuItem(item.menuItemId);
        if (!menuItem) {
          return res.status(400).json({ message: `Menu item ${item.menuItemId} not found` });
        }
        const price = item.size === "half" && menuItem.halfPrice ? menuItem.halfPrice : menuItem.price;
        subtotal += price * item.quantity;
        orderItems.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          size: item.size,
          price: price,
        });
      }

      // Calculate delivery charge based on distance
      let deliveryCharge = 0;
      if (input.deliveryDistance <= 3) {
        deliveryCharge = 40;
      } else if (input.deliveryDistance <= 7) {
        deliveryCharge = 70;
      } else if (input.deliveryDistance <= 15) {
        deliveryCharge = 120;
      } else {
        deliveryCharge = 150;
      }

      const paymentMethod = input.paymentMethod || "cod";
      const customer = await storage.getUser(req.session.userId!);
      const order = await storage.createOrder({
        userId: req.session.userId!,
        deliveryAddress: input.deliveryAddress,
        subtotal: subtotal,
        deliveryCharge: deliveryCharge,
        deliveryDistance: input.deliveryDistance,
        totalAmount: subtotal + deliveryCharge,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "upi" ? "paid" : "pending",
      }, orderItems);

      // Build WhatsApp message and send to admin (non-blocking)
      const whatsappMsg =
`NEW ORDER #${order.id}

Customer: ${customer?.name || "N/A"}
Phone: ${customer?.phone || "N/A"}

Items:
${orderItems.map((item, i) => `• ${input.items[i].size} x${input.items[i].quantity} = Rs.${item.price * input.items[i].quantity}`).join("\n")}

Subtotal: Rs.${subtotal}
Delivery: Rs.${deliveryCharge}
TOTAL: Rs.${subtotal + deliveryCharge}

Address: ${input.deliveryAddress}
Distance: ${input.deliveryDistance} km

Payment: ${paymentMethod === "upi" ? "UPI - Paid Online" : "Cash on Delivery"}`;

      sendWhatsAppToAdmin(whatsappMsg).catch(() => {});

      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.orders.myOrders.path, requireAuth, async (req, res) => {
    const orders = await storage.getOrdersByUser(req.session.userId!);
    res.status(200).json(orders);
  });

  app.get(api.orders.all.path, requireAdmin, async (req, res) => {
    const orders = await storage.getAllOrders();
    res.status(200).json(orders);
  });

  app.patch(api.orders.updateStatus.path, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      const { status } = api.orders.updateStatus.input.parse(req.body);
      const order = await storage.updateOrderStatus(id, status);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.status(200).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Call seed on start
  await seedDatabase();

  return httpServer;
}
