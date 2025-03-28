import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

//conifgurations in express (middlewares)
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))
app.use(express.json({limit: "30kb"}))
app.use(express.urlencoded({extended: true,limit: "20kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes

import userRouter from "./routes/user.routes.js";
import profileRouter from "./routes/profile.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/profile", profileRouter);


// http://localhost:8000/api/v1/users/

export default app;