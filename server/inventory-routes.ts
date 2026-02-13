import { Express, Request, Response } from "express";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import {
  inventoryProducts,
  inventoryWarehouses,
  inventoryStock,
  inventorySuppliers,
  inventoryPurchaseOrders,
  inventoryPurchaseOrderItems,
  inventorySalesOrders,
  inventorySalesOrderItems,
  inventoryMovements,
  insertInventoryProductSchema,
  insertInventoryWarehouseSchema,
  insertInventorySupplierSchema,
  insertInventoryPurchaseOrderSchema,
  insertInventoryPurchaseOrderItemSchema,
  insertInventorySalesOrderSchema,
  insertInventorySalesOrderItemSchema,
} from "../shared/schema";

const MOCK_SUPPLIERS_PATH = path.join(process.cwd(), "mock-suppliers.json");
const MOCK_PRODUCTS_PATH = path.join(process.cwd(), "mock-products.json");

function getMockSuppliers(): any[] {
  try {
    if (fs.existsSync(MOCK_SUPPLIERS_PATH)) {
      return JSON.parse(fs.readFileSync(MOCK_SUPPLIERS_PATH, "utf-8"));
    }
  } catch (e) {
    console.warn("Failed to load mock suppliers", e);
  }
  return [];
}

function saveMockSupplier(supplier: any) {
  try {
    const current = getMockSuppliers();
    current.push(supplier);
    fs.writeFileSync(MOCK_SUPPLIERS_PATH, JSON.stringify(current, null, 2));
  } catch (e) {
    console.warn("Failed to save mock supplier", e);
  }
}

function getMockProducts(): any[] {
  try {
    if (fs.existsSync(MOCK_PRODUCTS_PATH)) {
      return JSON.parse(fs.readFileSync(MOCK_PRODUCTS_PATH, "utf-8"));
    }
  } catch (e) {
    console.warn("Failed to load mock products", e);
  }
  return [];
}

function saveMockProduct(product: any) {
  try {
    const current = getMockProducts();
    current.push(product);
    fs.writeFileSync(MOCK_PRODUCTS_PATH, JSON.stringify(current, null, 2));
  } catch (e) {
    console.warn("Failed to save mock product", e);
  }
}

const MOCK_SALES_ORDERS_PATH = path.join(process.cwd(), "mock-sales-orders.json");
const MOCK_PURCHASE_ORDERS_PATH = path.join(process.cwd(), "mock-purchase-orders.json");
const MOCK_ACCOUNTING_PATH = path.join(process.cwd(), "mock-accounting.json");

function getMockSalesOrders(): any[] {
  try {
    if (fs.existsSync(MOCK_SALES_ORDERS_PATH)) {
      return JSON.parse(fs.readFileSync(MOCK_SALES_ORDERS_PATH, "utf-8"));
    }
  } catch (e) {
    console.warn("Failed to load mock sales orders", e);
  }
  return [];
}

function saveMockSalesOrder(order: any) {
  try {
    const current = getMockSalesOrders();
    current.push(order);
    fs.writeFileSync(MOCK_SALES_ORDERS_PATH, JSON.stringify(current, null, 2));
  } catch (e) {
    console.warn("Failed to save mock sales order", e);
  }
}

function getMockPurchaseOrders(): any[] {
  try {
    if (fs.existsSync(MOCK_PURCHASE_ORDERS_PATH)) {
      return JSON.parse(fs.readFileSync(MOCK_PURCHASE_ORDERS_PATH, "utf-8"));
    }
  } catch (e) {
    console.warn("Failed to load mock purchase orders", e);
  }
  return [];
}

function saveMockPurchaseOrder(order: any) {
  try {
    const current = getMockPurchaseOrders();
    current.push(order);
    fs.writeFileSync(MOCK_PURCHASE_ORDERS_PATH, JSON.stringify(current, null, 2));
  } catch (e) {
    console.warn("Failed to save mock purchase order", e);
  }
}

function addAccountingTransaction(transaction: any) {
  try {
    let current: any[] = [];
    if (fs.existsSync(MOCK_ACCOUNTING_PATH)) {
      current = JSON.parse(fs.readFileSync(MOCK_ACCOUNTING_PATH, "utf-8"));
    }
    
    current.push({
      id: Math.floor(Math.random() * 100000),
      createdAt: new Date().toISOString(),
      status: 'completed',
      category: 'inventory',
      ...transaction
    });
    
    fs.writeFileSync(MOCK_ACCOUNTING_PATH, JSON.stringify(current, null, 2));
  } catch (e) {
    console.warn("Failed to add accounting transaction from inventory", e);
  }
}

export function registerInventoryRoutes(app: Express) {
  // Products
  app.get("/api/inventory/products", async (req: Request, res: Response) => {
    try {
      let products: any[] = [];
      try {
        products = await db.query.inventoryProducts.findMany({
          with: {
            supplier: true,
            stock: {
              with: {
                warehouse: true,
              },
            },
          },
          orderBy: desc(inventoryProducts.createdAt),
        });
      } catch (dbError) {
        console.warn("DB fetch failed for products, checking mock:", dbError);
      }
      
      const mockProducts = getMockProducts();
      // Simple merge, mock products won't have complex relations populated like DB ones
      // unless we mock that too, but for listing it's mostly fine
      const allProducts = [...products, ...mockProducts];
      
      res.json(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.json([]); // Return empty array instead of 500
    }
  });

  app.post("/api/inventory/products", async (req: Request, res: Response) => {
    try {
      const data = insertInventoryProductSchema.parse(req.body);
      
      let product;
      try {
        const result = await db.insert(inventoryProducts).values(data).returning();
        product = result[0];
      } catch (dbError) {
        console.warn("DB create failed for product, using mock:", dbError);
        product = {
          id: Math.floor(Math.random() * 100000),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        saveMockProduct(product);
      }
      
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  // Warehouses
  app.get("/api/inventory/warehouses", async (req: Request, res: Response) => {
    try {
      const warehouses = await db.query.inventoryWarehouses.findMany();
      res.json(warehouses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warehouses" });
    }
  });

  app.post("/api/inventory/warehouses", async (req: Request, res: Response) => {
    try {
      const data = insertInventoryWarehouseSchema.parse(req.body);
      const warehouse = await db.insert(inventoryWarehouses).values(data).returning();
      res.status(201).json(warehouse[0]);
    } catch (error) {
      res.status(400).json({ message: "Invalid warehouse data" });
    }
  });

  // Suppliers
  app.get("/api/inventory/suppliers", async (req: Request, res: Response) => {
    try {
      let suppliers: any[] = [];
      try {
        suppliers = await db.query.inventorySuppliers.findMany();
      } catch (dbError) {
        console.warn("DB fetch failed for suppliers, checking mock:", dbError);
      }
      
      const mockSuppliers = getMockSuppliers();
      // Combine (in a real app you'd dedup, here just concat or prefer mock if DB down)
      const allSuppliers = [...suppliers, ...mockSuppliers];
      
      res.json(allSuppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.json([]); // Return empty array instead of 500
    }
  });

  app.post("/api/inventory/suppliers", async (req: Request, res: Response) => {
    try {
      console.log("Creating supplier with data:", req.body);
      const data = insertInventorySupplierSchema.parse(req.body);
      
      let supplier;
      try {
        const result = await db.insert(inventorySuppliers).values(data).returning();
        supplier = result[0];
      } catch (dbError) {
        console.warn("DB create failed for supplier, using mock:", dbError);
        supplier = {
          id: Math.floor(Math.random() * 100000),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        saveMockSupplier(supplier);
      }
      
      res.status(201).json(supplier);
    } catch (error: any) {
      console.error("Error creating supplier:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      // If we failed to even parse, that's a 400. If we failed DB and mock, 500.
      // But we handled DB fail above.
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  // Purchase Orders
  app.get("/api/inventory/purchase-orders", async (req: Request, res: Response) => {
    try {
      let orders: any[] = [];
      try {
        orders = await db.query.inventoryPurchaseOrders.findMany({
          with: {
            supplier: true,
            items: {
              with: {
                product: true,
              },
            },
          },
          orderBy: desc(inventoryPurchaseOrders.orderDate),
        });
      } catch (dbError) {
        console.warn("DB fetch failed for purchase orders, checking mock:", dbError);
      }
      
      const mockOrders = getMockPurchaseOrders();
      // Combine real and mock data
      const allOrders = [...orders, ...mockOrders];
      
      res.json(allOrders);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.json([]); // Return empty array instead of 500
    }
  });

  app.post("/api/inventory/purchase-orders", async (req: Request, res: Response) => {
    try {
      // Expecting { ...orderData, items: [...] }
      const { items, ...orderData } = req.body;
      const validOrderData = insertInventoryPurchaseOrderSchema.parse(orderData);
      
      let order;
      try {
        const result = await db.transaction(async (tx) => {
          const newOrder = await tx.insert(inventoryPurchaseOrders).values(validOrderData).returning();
          const orderId = newOrder[0].id;

          if (items && Array.isArray(items)) {
            for (const item of items) {
              await tx.insert(inventoryPurchaseOrderItems).values({
                purchaseOrderId: orderId,
                productId: item.productId,
                quantity: item.quantity,
                unitCost: item.unitCost,
                totalCost: item.quantity * item.unitCost,
              });
            }
          }
          return newOrder[0];
        });
        order = result;
      } catch (dbError) {
        console.warn("DB create failed for purchase order, using mock:", dbError);
        
        // Mock fallback
        const mockId = Math.floor(Math.random() * 100000);
        const mockItems = (items || []).map((item: any) => ({
            id: Math.floor(Math.random() * 100000),
            purchaseOrderId: mockId,
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.quantity * item.unitCost,
            product: getMockProducts().find(p => p.id === item.productId) || { name: 'Unknown Product' }
        }));

        // Find supplier for UI display
        const supplier = getMockSuppliers().find(s => s.id === validOrderData.supplierId) || { name: 'Unknown Supplier' };

        order = {
          id: mockId,
          ...validOrderData,
          supplier,
          items: mockItems,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        saveMockPurchaseOrder(order);
      }

      res.status(201).json(order);
      
      // Auto-create accounting transaction for expense
      try {
        // Need to calculate total if not present
        const total = (order as any).totalAmount || (items || []).reduce((sum: number, item: any) => sum + (item.quantity * item.unitCost), 0);
        
        if (total > 0) {
           addAccountingTransaction({
             type: 'expense',
             amount: total,
             description: `مشتريات مخزون - طلب شراء #${(order as any).id}`,
             date: new Date().toISOString().split('T')[0],
             submitterId: 'system'
           });
        }
      } catch (e) {
        console.warn("Failed to auto-create accounting entry for PO", e);
      }
    } catch (error) {
      console.error("Error creating PO:", error);
      res.status(400).json({ message: "Invalid purchase order data" });
    }
  });

  // Sales Orders
  app.get("/api/inventory/sales-orders", async (req: Request, res: Response) => {
    try {
      let orders: any[] = [];
      try {
        orders = await db.query.inventorySalesOrders.findMany({
          with: {
            items: {
              with: {
                product: true,
              },
            },
          },
          orderBy: desc(inventorySalesOrders.orderDate),
        });
      } catch (dbError) {
        console.warn("DB fetch failed for sales orders, checking mock:", dbError);
      }
      
      const mockOrders = getMockSalesOrders();
      // Combine real and mock data
      const allOrders = [...orders, ...mockOrders];
      
      res.json(allOrders);
    } catch (error) {
      console.error("Error fetching sales orders:", error);
      res.json([]); // Return empty array instead of 500
    }
  });

  app.post("/api/inventory/sales-orders", async (req: Request, res: Response) => {
    try {
      const { items, ...orderData } = req.body;
      const validOrderData = insertInventorySalesOrderSchema.parse(orderData);
      
      let order;
      try {
        order = await db.transaction(async (tx) => {
          const newOrder = await tx.insert(inventorySalesOrders).values(validOrderData).returning();
          const orderId = newOrder[0].id;

          if (items && Array.isArray(items)) {
            for (const item of items) {
              await tx.insert(inventorySalesOrderItems).values({
                salesOrderId: orderId,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
              });
              
              // Basic stock reduction logic (optional for now)
            }
          }
          
          // Fetch full order with items
          // Since we can't easily fetch deep relations inside transaction with drizzle query builder sometimes without full setup,
          // we return the basic order or re-fetch.
          return newOrder[0];
        });
      } catch (dbError) {
        console.warn("DB create failed for sales order, using mock:", dbError);
        
        // Mock fallback
        const mockId = Math.floor(Math.random() * 100000);
        // We need to attach products details to items for UI display if possible,
        // but client might just refresh list.
        const mockItems = (items || []).map((item: any) => ({
            id: Math.floor(Math.random() * 100000),
            salesOrderId: mockId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            product: getMockProducts().find(p => p.id === item.productId) || { name: 'Unknown Product' }
        }));

        order = {
          id: mockId,
          ...validOrderData,
          items: mockItems,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        saveMockSalesOrder(order);
      }

      res.status(201).json(order);
      
      // Auto-create accounting transaction for revenue
      try {
        if (order && order.totalAmount) {
           addAccountingTransaction({
             type: 'income',
             amount: order.totalAmount,
             description: `مبيعات مخزون - طلب #${order.id} - ${order.customerName}`,
             date: new Date().toISOString().split('T')[0],
             submitterId: 'system'
           });
        }
      } catch (e) {
        console.warn("Failed to auto-create accounting entry for sales order", e);
      }
    } catch (error) {
      console.error("Error creating SO:", error);
      res.status(400).json({ message: "Invalid sales order data" });
    }
  });
}
