export const env = {
    MONGO_URL: process.env.MONGO_URL,
    PORT: process.env.PORT || 8080,
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
}