export const env = {
    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/monvieuxgrimoire',
    PORT: process.env.PORT || 8080,
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
}