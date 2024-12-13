import express, { Application, Request, Response } from "express";
import path from "path";
import multer from "multer";
import bcrypt from "bcrypt";
import { Users } from "./db_connection"; // Assuming this exists
import logger from "./logger";
import { Op } from "sequelize";

const app: Application = express();
const port = 3002;

// Configure multer for file uploads
const upload = multer({
    dest: "uploads/",
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"));
        }
    }
});

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.resolve(__dirname, "../client/build")));

app.post("/login", upload.single('idConfirmation'), (req: Request, res: Response) => {
    (async () => {
        try {
            // Log incoming data for debugging
            console.log("Body:", req.body);
            console.log("File:", req.file);

            // Extract form data
            const {
                name,
                address,
                city,
                phoneNumber,
                postcode,
                country,
                username,
                email,
                password,
                dateOfBirth
            } = req.body;

            // Check for missing fields
            if (!name || !address || !city || !phoneNumber || !postcode || !country || !username || !email || !password || !dateOfBirth) {
                logger.error(`Missing required fields`);
                return res.status(400).json({ message: "Missing required fields" });
            }

            // Return P

            // Respond with the detailed structure
            res.status(200).send("OK");

        } catch (error) {
            // Log and handle any errors
            logger.error(`Error processing login request: ${error instanceof Error ? error.message : "Unknown error"}`);
            res.status(500).json({ message: "Internal Server Error", error: error instanceof Error ? error.message : "Unknown error" });
        }
    })();
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
