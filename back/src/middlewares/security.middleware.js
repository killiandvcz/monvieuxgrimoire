// src/middlewares/security.middleware.js
import { rateLimit } from 'express-rate-limit';

/**
 * Configuration des en-têtes de sécurité
 */
export function securityHeaders(req, res, next) {
  // Protection contre le clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Protection contre le MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Protection XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Désactiver la mise en cache des données sensibles
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Politique des référents
  res.setHeader('Referrer-Policy', 'no-referrer');
  
  // Content Security Policy (CSP)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'none';"
  );
  
  // Permissions Policy (anciennement Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  next();
}

/**
 * Limiteur de débit pour les requêtes d'authentification
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, veuillez réessayer plus tard',
  },
});

/**
 * Limiteur de débit général pour l'API
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard',
  },
});

/**
 * Validation des paramètres de requête pour éviter les injections
 */
export function sanitizeRequestParams(req, res, next) {
  // Vérification basique des paramètres d'URL
  if (req.params.id && !/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Format d\'identifiant invalide',
    });
  }
  
  next();
}

/**
 * Gère les erreurs de manière sécurisée pour éviter les fuites d'informations
 */
export function errorHandler(err, req, res, next) {
  console.error('Erreur serveur:', err);
  
  // Ne pas exposer les détails d'erreur en production
  const isProd = process.env.NODE_ENV === 'production';
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: isProd ? 'Une erreur est survenue' : err.message,
  });
}