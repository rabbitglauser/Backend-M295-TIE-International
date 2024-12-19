import express, {Application, NextFunction, Request, Response} from "express";
import path from "path";
import multer from "multer";
import bcrypt from "bcrypt";
import {Users} from "./db_connection";
import logger from "./logger"; // Logger utility for logging
import {Op} from "sequelize";

// Main application class
class App {
    private app: Application;
    private port: number;

    constructor(port: number) {
        this.app = express();
        this.port = port;

        // Initialize middleware and routes
        this.initializeMiddleware(); // Middleware initialization for handling requests
        this.initializeRoutes(); // Route setup for application features
    }

    // Middleware initialization for the application
    private initializeMiddleware(): void {
        // Logging each incoming request with method and URL
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            logger.info(`Incoming Request: ${req.method} ${req.url}`);
            next(); // Proceed to handle other middleware or routes
        });

        this.app.use(express.json()); // Middleware to parse JSON payloads in requests
        this.app.use(express.urlencoded({extended: true})); // For parsing URL-encoded request bodies

        // Serve static files from the "client/build" directory
        this.app.use(express.static(path.resolve(__dirname, "../client/build")));
    }

    // Route initialization
    private initializeRoutes(): void {
        // Configure multer for file uploads
        const upload = this.configureMulter();

        logger.info("Initializing application routes"); // Log route setup process

        // POST route for user login requests
        this.app.post("/login", upload.single("idConfirmation"), AppController.handleLogin);
    }

    // Multer configuration for handling file uploads
    private configureMulter(): multer.Multer {
        return multer({
            dest: path.resolve(__dirname, "../uploads"), // Directory for storing uploaded files
            fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
                logger.info("Processing file upload"); // Log start of file upload processing

                // Allowed file types for uploads
                const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

                // Validate file type
                if (allowedTypes.includes(file.mimetype)) {
                    logger.info(`Valid file type: ${file.mimetype}`); // Log valid file type
                    cb(null, true); // Accept file for upload
                } else {
                    logger.error(`Invalid file type uploaded: ${file.mimetype}`); // Log invalid file type error
                    cb(new Error("Invalid file type")); // Reject file upload
                }
            },
        });
    }

    // Start the server on the defined port
    public start(): void {
        this.app.listen(this.port, () => {
            logger.info(`Server running on port ${this.port}`); // Log server start message
        });
    }
}

// Controller class to handle application-level logic
class AppController {
    // Login route handler
    public static async handleLogin(req: Request, res: Response): Promise<void> {
        try {
            logger.info("Received request to '/login'"); // Log request initiation
            logger.info("File uploaded: " + JSON.stringify(req.file || {})); // Log uploaded file details

            // Extract form data from the request
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

            logger.info("Extracting form data from request body"); // Log data extraction
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

            // Validate required fields in the extracted data
            if (!name || !address || !city || !phoneNumber || !postcode || !country || !username || !email || !password || !dateOfBirth) {
                logger.error("Validation failed: Missing required fields"); // Log missing fields error
                res.status(400).send({message: "Missing required fields"});
                return;
            }

            logger.info("Checking the database for existing user records"); // Log user existence check

            // Query the database for existing users with the same credentials
            const existingUser = await Users.findOne({
                where: {
                    [Op.or]: [
                        {email: {[Op.eq]: email.toLowerCase()}},
                        {username: {[Op.eq]: username}},
                    ],
                },
            });

            // Handle case where user already exists
            if (existingUser) {
                const isEmailDuplicate = (existingUser as any).email?.toLowerCase() === email.toLowerCase();
                const isUsernameDuplicate = (existingUser as any).username === username;

                logger.warn(
                    `User already exists. Email duplicate: ${isEmailDuplicate}, Username duplicate: ${isUsernameDuplicate}`
                );

                if (isEmailDuplicate && isUsernameDuplicate) {
                    res.status(405).send("Duplicate Username and Email");
                    return;
                }
                if (isUsernameDuplicate) {
                    res.status(405).send("Username already taken");
                    return;
                }
                if (isEmailDuplicate) {
                    res.status(405).send("Email already taken");
                    return;
                }
            }

            // Hashing passwords for secure storage
            logger.info("Generating salt for password hashing"); // Log salt generation
            const salt = bcrypt.genSaltSync(10); // Generate password salt

            logger.info("Hashing the user's password"); // Log password hashing
            const hashedPassword = bcrypt.hashSync(password, salt); // Hash user's password

            logger.info("Saving new user to the database"); // Log user save process
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

            if (newUser) {
                logger.info(`User '${username}' registered successfully`); // Log successful registration
                res.status(200).send("OK"); // Send success response
                return;
            }

            logger.error(`Failed to register user '${username}'`); // Log user registration failure
            res.status(500).send({message: "Failed to register user"});
        } catch (error) {
            logger.error(`Error occurred while processing '/login': ${error instanceof Error ? error.message : "Unknown error"}`);
            res.status(500).send({
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}

const server = new App(3002); // Create application instance with port 3002
server.start(); // Start the application