import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { authRouter } from "./routes/auth.routes";
import { publicBookRouter } from "./routes/books.routes";
import { printRoutes } from "./utils/routes.utils";

const app = express();
const apiRouter = express.Router();

app.use("/uploads", express.static("uploads"));

apiRouter.use(cors());
apiRouter.use(express.json());
apiRouter.use('/auth', authRouter);
apiRouter.use('/books', publicBookRouter);



app.use('/api', apiRouter);

printRoutes(app);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log('Connected to MongoDB');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})