import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { 
    type: String, 
    required: [true, 'L\'email est requis'], 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir une adresse email valide']
  },
  password: { 
    type: String, 
    required: [true, 'Le mot de passe est requis']
  }
}, { 
  timestamps: true 
});

export const User = mongoose.model('User', userSchema);