// src/config/mongo.config.js
import mongoose from 'mongoose';
import { env } from './env.config.js';

/**
 * Configuration sécurisée pour la connexion MongoDB
 */
export async function connectToMongoDB() {
  try {
    await mongoose.connect(env.MONGO_URL, {
      // Configuration sécurisée
      serverSelectionTimeoutMS: 5000, // Timeout de sélection du serveur pour éviter les attaques de type DoS
      socketTimeoutMS: 45000, // Timeout des sockets pour éviter les connexions zombies
      maxPoolSize: 50, // Limiter le nombre de connexions simultanées
    });
    
    console.log('Connecté à MongoDB avec succès');
    
    // Gestion propre de la déconnexion lors de l'arrêt de l'application
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
      process.exit(0);
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error.message);
    process.exit(1);
  }
}