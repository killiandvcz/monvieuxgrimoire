import express from 'express';
import {z} from 'zod';
import { User } from '../models';
import { createToken } from '../utils/token.utils';
import { env } from '../config/env.config';

export const authRouter = express.Router();

const authSchema = z.object({
    email: z.string().email({message: "Email invalide"}),
    password: z.string().min(6, {message: "Le mot de passe doit contenir au moins 6 caractères"})
});

const validate = (schema) => (req, res, next) => {
    try {
        console.log(req.body);
        
        schema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.errors[0]
        });
    }
};

authRouter.post('/signup', validate(authSchema), async (req, res) => {
    const { email, password } = req.body;

    const hash = await Bun.password.hash(password);

    const existingUser = await User.findOne({
        email
    });

    if (existingUser) return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé"
    });

    const user = User.create({
        email,
        password: hash
    });

    (await user).save();

    return res.status(201).json({
        success: true,
        message: "Utilisateur créé"
    });
});

authRouter.post('/login', validate(authSchema), async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
        email
    });
    

    if (!user) return res.status(400).json({
        success: false,
        message: "Email ou mot de passe incorrect"
    });

    const match = await Bun.password.verify(password, user.password);

    if (!match) return res.status(400).json({
        success: false,
        message: "Email ou mot de passe incorrect"
    });

    const token = await createToken({
        id: user._id,
        email: user.email
    }, env.JWT_SECRET, '24h');


    return res.status(200).json({
        success: true,
        userId: user.id,
        token
    });
    
});
