// src/utils/image.utils.js
import { unlink } from 'node:fs/promises';
import path from 'path';
import { URL } from 'url';

/**
 * Extrait le nom du fichier à partir d'une URL d'image
 * @param {string} imageUrl - L'URL complète de l'image
 * @returns {string|null} - Le nom du fichier ou null si l'URL est invalide
 */
export function extractFilenameFromUrl(imageUrl) {
  if (!imageUrl) return null;
  
  try {
    // Extraction du chemin de l'URL
    const pathname = new URL(imageUrl).pathname;
    // Récupération du nom du fichier
    return path.basename(pathname);
  } catch (error) {
    console.error(`Erreur lors de l'extraction du nom de fichier: ${error.message}`);
    return null;
  }
}

/**
 * Supprime un fichier image du système de fichiers
 * @param {string} imageUrl - L'URL complète de l'image à supprimer
 * @returns {Promise<boolean>} - true si la suppression a réussi, false sinon
 */
export async function deleteImageFile(imageUrl) {
  const filename = extractFilenameFromUrl(imageUrl);
  if (!filename) return false;
  
  try {
    const filepath = path.join(process.cwd(), 'uploads', filename);
    await unlink(filepath);
    console.log(`Image supprimée: ${filename}`);
    return true;
  } catch (error) {
    // Si le fichier n'existe pas, considérons cela comme un succès
    if (error.code === 'ENOENT') {
      console.warn(`L'image ${filename} n'existe pas ou a déjà été supprimée`);
      return true;
    }
    
    console.error(`Erreur lors de la suppression de l'image: ${error.message}`);
    return false;
  }
}