// src/config/mongo.config.js
import mongoose from 'mongoose';
import { env } from './env.config.js';

/**
 * Configuration sécurisée pour la connexion MongoDB
 */
export async function connectToMongoDB() {
  try {
    await mongoose.connect(env.MONGO_URL, {
      
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000, 
      maxPoolSize: 50, 
    });
    
    console.log('Connecté à MongoDB avec succès');
    
    
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