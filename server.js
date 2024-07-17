import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import { fileURLToPath } from 'url'; // To convert import.meta.url to a pathname
import { dirname } from 'path'; // To get the directory name from a file path
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";
import path from "path";

// Configure environment variables
dotenv.config();

// Connect to the database
connectDB();

// Create Express application
const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests
app.use(morgan("dev")); // HTTP request logger

// Determine the directory path using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, "./client/build")));

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/subcategory", subCategoryRoutes);

// Serve React app for any other unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});

// Define the port to listen on
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.cyan);
});
