import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { authRouter } from "./routes/auth.routes";
import { publicBookRouter } from "./routes/books.routes";
import { printRoutes } from "./utils/routes.utils";
import { 
    securityHeaders, 
    authRateLimiter, 
    apiRateLimiter,
    sanitizeRequestParams,
    errorHandler
} from "./middlewares/security.middleware";
import { connectToMongoDB } from "./config/mongo.config";
import { env } from "./config/env.config";

async function startServer() {
      // Initialisation de l'application Express
  const app = express();
  const apiRouter = express.Router();
  
  // Connexion à MongoDB
  await connectToMongoDB();
  
  // Middleware pour servir les fichiers statiques
  app.use("/uploads", express.static("uploads"));
  
  // Middleware de sécurité global
  app.use(securityHeaders);
  
  // Configuration CORS sécurisée
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://votre-frontend-url.com'] // Domaines autorisés en production
      : ['http://localhost:3000', 'http://localhost:4200'], // Domaines autorisés en développement
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length'],
    credentials: true,
    maxAge: 86400, // 24 heures
  };
  
  // Application des middlewares au router API
  apiRouter.use(cors(corsOptions));
  apiRouter.use(express.json({ limit: '1mb' })); // Limiter la taille des requêtes JSON
  apiRouter.use(express.urlencoded({ extended: true, limit: '1mb' }));
  apiRouter.use(apiRateLimiter); // Rate limiting global
  apiRouter.use(sanitizeRequestParams); // Validation des paramètres
  
  // Routes d'authentification avec rate limiting spécifique
  apiRouter.use('/auth', authRateLimiter, authRouter);
  
  // Routes des livres
  apiRouter.use('/books', publicBookRouter);
  
  // Attribution du routeur API à l'application
  app.use('/api', apiRouter);
  
  // Middleware de gestion des erreurs
  app.use(errorHandler);
  
  // Route 404 pour les chemins non trouvés
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route non trouvée'
    });
  });
  
  // Affichage des routes pour le débogage
  if (process.env.NODE_ENV !== 'production') {
    printRoutes(app);
  }
  
  // Démarrage du serveur
  const PORT = env.PORT;
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

startServer();