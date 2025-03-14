import express from "express";
import { Book } from "../models";
import { authMiddleware } from "../utils/token.utils";
import { env } from "../config/env.config";
import { upload } from "../config/multer.config";
import sharp from "sharp";
import path from "path";
import { readdir, mkdir } from "node:fs/promises";
import { deleteImageFile } from "../utils/image.utils";

export const publicBookRouter = express.Router();

publicBookRouter.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        console.log("BOOKS", books);
        return res.status(200).json([...books]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des livres"
        });
    }
    
    
});

publicBookRouter.get('/bestrating', async (req, res) => {
    
    const books = await Book.find({
        ratings: {
            $exists: true,
            $not: {
                $size: 0
            }
        }
    }).sort({
        averageRating: -1
    }).limit(3).populate({
        path: 'userId',
        select: 'name email'
    });
    
    
    return res.status(200).json([...books]);
    
});

publicBookRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    const book = await Book
    .findById(id);
    
    if (!book) return res.status(404).json({
        success: false,
        message: "Livre introuvable"
    });
    
    return res.status(200).json(book);
});




export const authedBookRouter = express.Router();

publicBookRouter.post('/', authMiddleware(env.JWT_SECRET), upload.single("image"), async (req, res) => {
    console.log("BOOK");
    
    const data = req.body.book;
    const book = JSON.parse(data);
    
    const filename = crypto.randomUUID() + ".webp";
    const filepath = path.join(__dirname, "../../uploads", filename);
    
    const uploadDir = Bun.file("uploads");
    try {
        await readdir("uploads");
    } catch (error) {
        console.log("no uploads dir");
        await mkdir("uploads");
    }
    
    try {
        await sharp(req.file.buffer).webp({
            quality: 80
        }).toFile(filepath);
        
        book.imageUrl = `http://localhost:4000/uploads/${filename}`;
        book.ratings[0].userId = req.user.id;
        book.userId = req.user.id;
        
        console.log("USERID", req.user.id);
        const newBook = await Book.create({
            ...book,
        });
    
        newBook.calculateAverageRating();
        
        await newBook.save();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Erreur lors de la création du livre"
        });
    }
    
    return res.status(201).json({
        success: true,
        message: "Livre créé"
    });
})

publicBookRouter.put('/:id', authMiddleware(env.JWT_SECRET), upload.single("image"), async (req, res) => {
    const { id } = req.params;

    const existingBook = await Book.findById(id);
    if (!existingBook) return res.status(404).json({
        success: false,
        message: "Livre introuvable"
    });

    if (existingBook.userId.toString() !== req.user.id) return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à modifier ce livre"
    });
    
    const data = req.body.book;
    const book = typeof data === "string" ? JSON.parse(data) : req.body;
    
    let imageUrl = existingBook.imageUrl;
    const image = req.file ? req.file.buffer : null;
    
    if (image) {

        await deleteImageFile(existingBook.imageUrl);
        const filename = crypto.randomUUID() + ".webp";
        const filepath = path.join(__dirname, "../../uploads", filename);
        
        await sharp(image).webp({
            quality: 80
        }).toFile(filepath);
        
        imageUrl = `http://localhost:4000/uploads/${filename}`;
    }
    
    book.userId = req.user.id;
    book.imageUrl = imageUrl;

    if (!book.ratings) {
        book.ratings = existingBook.ratings;
    }
    
    const updatedBook = await Book.findByIdAndUpdate(id, {
        ...book
    }, { new: true });
    
    if (updatedBook.isModified('ratings')) {
        updatedBook.calculateAverageRating();
        await updatedBook.save();
    }
    
    return res.status(200).json({
        success: true,
        message: "Livre modifié"
    });
    
});


publicBookRouter.delete('/:id', authMiddleware(env.JWT_SECRET), async (req, res) => {
    const { id } = req.params;
    
    const book = await Book
    .findById(id);
    
    if (!book) return res.status(404).json({
        success: false,
        message: "Livre introuvable"
    });
    
    if (book.userId.toString() !== req.user.id) return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à supprimer ce livre"
    });
    

    await deleteImageFile(book.imageUrl);

    await Book
    .findByIdAndDelete(id);
    
    return res.status(200).json({
        success: true,
        message: "Livre supprimé"
    });
});

publicBookRouter.post('/:id/rating', authMiddleware(env.JWT_SECRET), async (req, res) => {
    const { id } = req.params;
console.log("ID", id);
console.log("BODY", req.body);

    
    const book
    = await Book.findById(id);

    const rating = book.ratings.find(rating => rating.userId.toString() === req.user.id);

    if (rating) {
        rating.grade = req.body.rating;
    } else {
        book.ratings.push({
            userId: req.user.id,
            grade: req.body.rating
        });
    }

    console.log("RATINGS",
    book.ratings);
    

    book.calculateAverageRating();

    await book.save();

    return res.status(200).json(book);
})