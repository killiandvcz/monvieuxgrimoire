// src/config/env.config.js

// Valider les variables d'environnement obligatoires au démarrage
function validateEnv() {
    const requiredEnvVars = ['JWT_SECRET'];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        if (envVar === 'JWT_SECRET' && process.env.NODE_ENV === 'production') {
          console.error(`⚠️ La variable d'environnement ${envVar} est manquante et requise en production`);
          process.exit(1);
        } else {
          console.warn(`⚠️ La variable d'environnement ${envVar} est manquante`);
        }
      }
    }
  }
  
  // Générer une clé secrète aléatoire si elle n'est pas définie (uniquement pour le développement)
  function generateSecretKey(length = 64) {
    if (process.env.NODE_ENV === 'production') return null;
    
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let result = '';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
  }
  
  // Valider les variables d'environnement
  validateEnv();
  
  // Configuration des variables d'environnement
  export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/monvieuxgrimoire',
    PORT: parseInt(process.env.PORT || '8080', 10),
    JWT_SECRET: process.env.JWT_SECRET || generateSecretKey(),
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requêtes
    IMAGE_QUALITY: parseInt(process.env.IMAGE_QUALITY || '80', 10), // Qualité WebP
    MAX_IMAGE_SIZE: parseInt(process.env.MAX_IMAGE_SIZE || '5242880', 10), // 5MB
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:4200').split(','),
    BASE_URL: process.env.BASE_URL || 'http://localhost:8080',
  };
  
  // Avertir si une clé JWT faible est utilisée en environnement de production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️ La clé JWT_SECRET est trop courte pour un environnement de production (min 32 caractères)');
  }