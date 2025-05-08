import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertDealSchema } from "@shared/schema";
import passport from "passport";
import { isAuthenticated, loginRequired } from "./auth";
import { getDashboardStats, getDealPerformance, getPlatformPerformance, getCategoryPerformance, getRecentActivity } from "./dashboard";
import { compareDeals } from "./comparison";
import { getAnalytics, trackEvent } from "./analytics";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get('/api/platforms', async (req: Request, res: Response) => {
    try {
      const platforms = await storage.getAllPlatforms();
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platforms" });
    }
  });

  app.get('/api/platforms/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid platform ID" });
      }

      const platform = await storage.getPlatform(id);
      if (!platform) {
        return res.status(404).json({ message: "Platform not found" });
      }

      res.json(platform);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platform" });
    }
  });

  app.get('/api/categories', async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/deals', async (req: Request, res: Response) => {
    try {
      const { platform, category, featured, latest, popular, expiring, search, limit } = req.query;
      let deals;

      // Parse the limit query parameter
      const parsedLimit = limit ? parseInt(limit as string) : 10;
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return res.status(400).json({ message: "Invalid limit parameter" });
      }

      if (featured === 'true') {
        deals = await storage.getFeaturedDeals();
      } else if (latest === 'true') {
        deals = await storage.getLatestDeals(parsedLimit);
      } else if (popular === 'true') {
        deals = await storage.getMostPopularDeals(parsedLimit);
      } else if (expiring) {
        const days = parseInt(expiring as string);
        if (isNaN(days)) {
          return res.status(400).json({ message: "Invalid expiring days parameter" });
        }
        deals = await storage.getExpiringDeals(days);
      } else if (search) {
        deals = await storage.searchDeals(search as string);
      } else if (platform) {
        const platformId = parseInt(platform as string);
        if (isNaN(platformId)) {
          return res.status(400).json({ message: "Invalid platform ID" });
        }
        deals = await storage.getDealsByPlatform(platformId);
      } else if (category) {
        const categoryId = parseInt(category as string);
        if (isNaN(categoryId)) {
          return res.status(400).json({ message: "Invalid category ID" });
        }
        deals = await storage.getDealsByCategory(categoryId);
      } else {
        deals = await storage.getAllDeals();
      }

      // Additional filtering for active deals by default
      const activeOnly = req.query.activeOnly !== 'false';
      if (activeOnly) {
        const now = new Date();
        deals = deals.filter(deal => deal.isActive && new Date(deal.expiryDate) > now);
      }

      res.json(deals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  app.get('/api/deals/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }

      const deal = await storage.getDeal(id);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      // Increment view count
      await storage.incrementDealViewCount(id);

      res.json(deal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deal" });
    }
  });

  app.post('/api/deals/:id/use', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }

      const deal = await storage.getDeal(id);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      // Increment used count
      await storage.incrementDealUsedCount(id);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to track deal usage" });
    }
  });

  app.post('/api/deals', async (req: Request, res: Response) => {
    try {
      const dealData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(dealData);
      res.status(201).json(deal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create deal" });
    }
  });

  app.patch('/api/deals/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }

      const dealUpdate = insertDealSchema.partial().parse(req.body);
      const updatedDeal = await storage.updateDeal(id, dealUpdate);
      
      if (!updatedDeal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      res.json(updatedDeal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update deal" });
    }
  });

  // Các route xác thực
  app.get('/api/auth/status', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      res.json({
        isAuthenticated: true,
        user: req.user
      });
    } else {
      res.json({
        isAuthenticated: false,
        user: null
      });
    }
  });

  // Facebook Auth Routes
  app.get('/auth/facebook', passport.authenticate('facebook', { 
    scope: ['email', 'public_profile'] 
  }));

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { 
      failureRedirect: '/login',
      session: true
    }),
    (req, res) => {
      // Chuyển hướng thành công sau khi đăng nhập
      res.redirect('/');
    }
  );

  // Google Auth Routes (đã bị ẩn, sẽ được kích hoạt sau)
  /* 
  app.get('/auth/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  }));

  app.get('/auth/google/callback',
    passport.authenticate('google', { 
      failureRedirect: '/login',
      session: true
    }),
    (req, res) => {
      // Chuyển hướng thành công sau khi đăng nhập
      res.redirect('/');
    }
  );
  */

  // Đăng xuất
  app.get('/auth/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.redirect('/');
    });
  });

  // API lấy thông tin người dùng hiện tại
  app.get('/api/users/me', isAuthenticated, (req: Request, res: Response) => {
    res.json(req.user);
  });

  // Dashboard API endpoints
  app.get('/api/dashboard/stats', loginRequired, getDashboardStats);
  app.get('/api/dashboard/performance/deals', loginRequired, getDealPerformance);
  app.get('/api/dashboard/performance/platforms', loginRequired, getPlatformPerformance);
  app.get('/api/dashboard/performance/categories', loginRequired, getCategoryPerformance);
  app.get('/api/dashboard/activity', loginRequired, getRecentActivity);
  
  // Analytics API endpoints
  app.get('/api/analytics', loginRequired, getAnalytics);
  app.post('/api/analytics/track', trackEvent);
  
  // Comparison API endpoint
  app.get('/api/deals/compare', compareDeals);

  const httpServer = createServer(app);
  return httpServer;
}
