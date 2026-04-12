import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";



import webhookRoutes from "./routes/webhook.route.js";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import { connectDB } from "./lib/db.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.set("trust proxy", 1);
app.use(
	cors({
		origin: [
			"http://localhost:5173",
			process.env.CLIENT_URL,
		].filter(Boolean),
		credentials: true,
	})
);
const PORT = process.env.PORT || 5000; 
const __dirname = path.resolve();

app.use("/api/webhook", webhookRoutes);


app.use(express.json({ limit: "5mb" }));
app.use((req, res, next) => {
	res.removeHeader("Content-Security-Policy");
	next();
});
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/", (_req, res) => {
    res.send("Backend server is running!");
});

if (process.env.NODE_ENV === "production") {
 
	app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

	app.get(/.*/, (req, res) => {
		res.sendFile(path.resolve(__dirname, "..", "frontend", "dist", "index.html"));
	});

}





app.listen(PORT, () => {
  console.log("server is up and running on http://localhost:" + PORT);

  connectDB();
});
