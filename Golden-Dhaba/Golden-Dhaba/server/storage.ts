import { db } from "./db";
import {
  users, menuItems, orders, orderItems,
  type User, type InsertUser, type MenuItem, type InsertMenuItem,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;

  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrdersByUser(userId: number): Promise<any[]>;
  getAllOrders(): Promise<any[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return await db.select().from(menuItems);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [created] = await db.insert(menuItems).values(item).returning();
    return created;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [updated] = await db.update(menuItems).set(item).where(eq(menuItems.id, id)).returning();
    return updated;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  async createOrder(order: InsertOrder & { subtotal: number; deliveryCharge: number; deliveryDistance: number; paymentMethod?: string; paymentStatus?: string }, items: InsertOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [createdOrder] = await tx.insert(orders).values({
        userId: order.userId,
        deliveryAddress: order.deliveryAddress,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        totalAmount: order.subtotal + order.deliveryCharge,
        deliveryDistance: order.deliveryDistance,
        paymentMethod: order.paymentMethod || "cod",
        paymentStatus: order.paymentStatus || "pending",
      }).returning();
      const itemsToInsert = items.map(item => ({
        ...item,
        orderId: createdOrder.id
      }));
      await tx.insert(orderItems).values(itemsToInsert);
      return createdOrder;
    });
  }

  async getOrdersByUser(userId: number): Promise<any[]> {
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: [desc(orders.createdAt)],
      with: {
        items: {
          with: {
            menuItem: true
          }
        }
      }
    });
    return userOrders;
  }

  async getAllOrders(): Promise<any[]> {
    const allOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            phone: true,
            email: true,
          }
        },
        items: {
          with: {
            menuItem: true
          }
        }
      }
    });
    return allOrders;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updated] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
