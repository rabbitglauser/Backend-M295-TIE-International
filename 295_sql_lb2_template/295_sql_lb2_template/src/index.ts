import express, {Application, Request, Response} from "express";
import path from "path";
import multer from "multer";
import bcrypt from "bcrypt";
import {Users} from "./db_connection"; // Assuming this exists
import logger from "./logger"; // Logger utility for logging
import {Op} from "sequelize";

const app: Application = express();
const port = 3002;

// Configure multer for file uploads
const upload = multer({
    dest: "uploads/",
    fileFilter: (req, file, cb) => {
        // Log file being processed
        logger.info("Processing file upload");

        // Define allowed file types
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

        // Validate file type
        if (allowedTypes.includes(file.mimetype)) {
            logger.info(`Valid file type: ${file.mimetype}`);
            cb(null, true); // Accept file
        } else {
            logger.error(`Invalid file type uploaded: ${file.mimetype}`); // Log invalid file type
            cb(new Error("Invalid file type")); // Reject file
        }
    },
});

class AppController {
    public static async handleLogin(req: Request, res: Response): Promise<void> {
        try {
            // Log incoming request to /login
            logger.info("Received request to '/login'");

            // Log uploaded file details
            logger.info("File uploaded: " + JSON.stringify(req.file || {}));

            // Extract form data from request body
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
                dateOfBirth,
            } = req.body;

            // Log extracted form data
            logger.info("Extracting form data");
            logger.info(
                `Extracted data: ${JSON.stringify({
                    name,
                    address,
                    city,
                    phoneNumber,
                    postcode,
                    country,
                    username,
                    email,
                    dateOfBirth,
                })}`
            );

            // Check for missing required fields
            logger.info("Validating input data for missing fields");
            if (!name || !address || !city || !phoneNumber || !postcode || !country || !username || !email || !password || !dateOfBirth) {
                logger.error("Validation failed: Missing required fields"); // Log validation error
                res.status(400).json({message: "Missing required fields"});
                return;
            }

            // Check if a user with the same username or email already exists
            logger.info("Checking if user already exists in the database");
            const existingUser = await Users.findOne({
                where: {
                    [Op.or]: [{username}, {email}],
                },
            });
            if (existingUser) {
                logger.warn(`User with username '${username}' or email '${email}' already exists`); // Log existence check
                res.status(400).json({message: "User already exists"});
                return;
            }

            // Generate salt for password hashing
            logger.info("Creating salt for password hashing");
            const salt = bcrypt.genSaltSync(10);

            // Hash the password with the generated salt
            logger.info("Hashing the user's password");
            const hashedPassword = bcrypt.hashSync(password, salt);

            // Save the new user to the database
            logger.info("Saving new user to the database");
            const newUser = await Users.create({
                username,
                password: hashedPassword,
                salt,
                email,
                full_name: name,
                country,
                postcode,
                city,
                address,
                phone_number: phoneNumber,
                date_of_birth: new Date(dateOfBirth),
                registration_time: new Date(),
            });

            // Log result after saving user
            if (newUser) {
                logger.info(`User '${username}' registered successfully`);
                res.status(200).send("OK");
            } else {
                logger.error(`Failed to register user '${username}'`);
                res.status(500).json({message: "Failed to register user"});
            }
        } catch (error) {
            // Log error details
            logger.error(`Error occurred while processing '/login': ${error instanceof Error ? error.message : "Unknown error"}`);
            res.status(500).json({
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}

// Middleware to log all incoming requests
app.use((req, res, next) => {
    logger.info(`Incoming Request: ${req.method} ${req.url}`); // Log request method and URL
    next(); // Proceed to next middleware
});

// Middleware to parse JSON and URL-encoded form data
app.use(express.json()); // Parse JSON data in request body
app.use(express.urlencoded({extended: true})); // Parse URL-encoded data

// Serve static files
app.use(express.static(path.resolve(__dirname, "../client/build"))); // Serve files from the client build directory

// Route setup for /login endpoint
app.post("/login", upload.single("idConfirmation"), AppController.handleLogin); // Use multer for file handling and login handling function

// Start the server on the specified port
app.listen(port, () => {
    logger.info(`Server running on port ${port}`); // Log server start
});