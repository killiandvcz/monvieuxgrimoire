import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    grade: { 
        type: Number, 
        required: true,
        min: 0,
        max: 5
    }
});

const bookSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    title: { 
        type: String, 
        required: [true, 'Le titre du livre est requis'],
        trim: true
    },
    author: { 
        type: String, 
        required: [true, 'L\'auteur du livre est requis'],
        trim: true
    },
    imageUrl: { 
        type: String, 
        required: [true, 'L\'URL de l\'image est requise']
    },
    year: { 
        type: Number,
        required: [true, 'L\'année de publication est requise'],
        min: 0,
        max: new Date().getFullYear()
    },
    genre: { 
        type: String, 
        required: [true, 'Le genre du livre est requis'],
        trim: true
    },
    ratings: [ratingSchema],
    averageRating: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 5
    }
}, { 
    timestamps: true 
});

// Méthode pour calculer la note moyenne
bookSchema.methods.calculateAverageRating = function() {
    if (this.ratings.length === 0) {
        this.averageRating = 0;
    } else {
        const sum = this.ratings.reduce((total, rating) => total + rating.grade, 0);
        this.averageRating = parseFloat((sum / this.ratings.length).toFixed(1));
    }
    return this.averageRating;
};

// Middleware pre-save pour calculer automatiquement la note moyenne avant d'enregistrer
bookSchema.pre('save', function(next) {
    if (this.isModified('ratings')) {
        this.calculateAverageRating();
    }
    next();
});

export const Book = mongoose.model('Book', bookSchema);