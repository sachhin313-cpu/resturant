import { z } from "zod";
import { 
  users, 
  menuItems, 
  orders, 
  orderItems, 
  insertUserSchema, 
  insertMenuItemSchema, 
  loginSchema,
  checkoutSchema
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

const userResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  phone: z.string(),
  isAdmin: z.boolean(),
});

const orderWithItemsSchema = z.object({
  id: z.number(),
  userId: z.number(),
  status: z.string(),
  subtotal: z.number().optional().default(0),
  deliveryCharge: z.number().optional().default(0),
  deliveryDistance: z.number().optional().default(0),
  totalAmount: z.number(),
  deliveryAddress: z.string(),
  createdAt: z.string().or(z.date()),
  paymentMethod: z.string().optional().default("cod"),
  paymentStatus: z.string().optional().default("pending"),
  user: z.object({
    id: z.number(),
    name: z.string(),
    phone: z.string(),
    email: z.string(),
  }).nullable().optional(),
  items: z.array(z.object({
    id: z.number(),
    orderId: z.number(),
    menuItemId: z.number(),
    quantity: z.number(),
    size: z.string(),
    price: z.number(),
    menuItem: z.object({
      name: z.string(),
      imageUrl: z.string().nullable(),
    }).optional()
  }))
});

export const api = {
  auth: {
    register: {
      method: "POST" as const,
      path: "/api/auth/register" as const,
      input: insertUserSchema,
      responses: {
        201: userResponseSchema,
        400: errorSchemas.validation,
      },
    },
    login: {
      method: "POST" as const,
      path: "/api/auth/login" as const,
      input: loginSchema,
      responses: {
        200: userResponseSchema,
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/auth/logout" as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/auth/me" as const,
      responses: {
        200: userResponseSchema,
        401: errorSchemas.unauthorized,
      },
    },
  },
  menu: {
    list: {
      method: "GET" as const,
      path: "/api/menu" as const,
      responses: {
        200: z.array(z.custom<typeof menuItems.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/menu" as const,
      input: insertMenuItemSchema,
      responses: {
        201: z.custom<typeof menuItems.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/menu/:id" as const,
      input: insertMenuItemSchema.partial(),
      responses: {
        200: z.custom<typeof menuItems.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/menu/:id" as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  orders: {
    create: {
      method: "POST" as const,
      path: "/api/orders" as const,
      input: checkoutSchema,
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    myOrders: {
      method: "GET" as const,
      path: "/api/orders/me" as const,
      responses: {
        200: z.array(orderWithItemsSchema),
        401: errorSchemas.unauthorized,
      },
    },
    all: {
      method: "GET" as const,
      path: "/api/orders" as const,
      responses: {
        200: z.array(orderWithItemsSchema),
        401: errorSchemas.unauthorized,
      },
    },
    updateStatus: {
      method: "PATCH" as const,
      path: "/api/orders/:id/status" as const,
      input: z.object({ status: z.string() }),
      responses: {
        200: z.custom<typeof orders.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
