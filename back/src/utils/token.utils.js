import * as jose from 'jose';

/**
 * Crée un JWT avec jose
 * @param {Object} payload - Les données à inclure dans le token
 * @param {string} secret - La clé secrète pour signer le token
 * @param {string} expiresIn - Durée de validité (ex: '1h', '1d', '7d')
 * @returns {Promise<string>} - Le token JWT généré
 */
async function createToken(payload, secret, expiresIn = '1h') {
  // Convertir la clé secrète en format utilisable par jose
  const secretKey = new TextEncoder().encode(secret);
  
  // Définir les options d'expiration
  const expDuration = parseDuration(expiresIn);
  
  // Créer et signer le token
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()  // Moment de création
    .setExpirationTime(expDuration) // Moment d'expiration
    .sign(secretKey);
  
  return jwt;
}

/**
 * Vérifie et décode un JWT
 * @param {string} token - Le token JWT à vérifier
 * @param {string} secret - La clé secrète utilisée pour la signature
 * @returns {Promise<Object>} - Le payload décodé si le token est valide
 */
async function verifyToken(token, secret) {
  const secretKey = new TextEncoder().encode(secret);
  
  try {
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
}

/**
 * Fonction utilitaire pour convertir des formats comme '1h', '2d' en secondes
 */
function parseDuration(duration) {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1));
  
  const now = Math.floor(Date.now() / 1000); // Temps actuel en secondes
  
  switch (unit) {
    case 's': return now + value;
    case 'm': return now + value * 60;
    case 'h': return now + value * 60 * 60;
    case 'd': return now + value * 24 * 60 * 60;
    default: return now + 3600; // Par défaut 1 heure
  }
}

// Exemple d'utilisation
async function exampleUsage() {
  const secret = 'votre_cle_secrete_tres_longue_et_complexe';
  
  // Création d'un token
  const payload = { 
    id: '123456',
    email: 'utilisateur@exemple.com',
    role: 'utilisateur'
  };
  
  const token = await createToken(payload, secret, '1d');
  console.log('Token généré:', token);
  
  // Vérification d'un token
  try {
    const decoded = await verifyToken(token, secret);
    console.log('Token décodé:', decoded);
  } catch (error) {
    console.error('Erreur de vérification:', error.message);
  }
}

// Implémentation dans Express
function authMiddleware(secret) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = await verifyToken(token, secret);
      req.user = decoded; // Stocke les infos utilisateur pour les routes suivantes
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
  };
}

export { createToken, verifyToken, authMiddleware };