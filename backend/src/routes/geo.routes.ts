import { Router } from "express";
import * as GeoController from "../controllers/geo.controller";

const router = Router();

// GET /api/geo/detect - Detect user location from IP
router.get("/detect", GeoController.detectLocation);

// GET /api/geo/shipping - Calculate shipping for a country and order total
router.get("/shipping", GeoController.getShippingRates);

// GET /api/geo/shipping/zones - Get all shipping zones
router.get("/shipping/zones", GeoController.getAllShippingZones);

// GET /api/geo/currencies - Get list of supported currencies
router.get("/currencies", GeoController.getCurrencies);

// GET /api/geo/convert - Convert between currencies
router.get("/convert", GeoController.convertCurrency);

export default router;
