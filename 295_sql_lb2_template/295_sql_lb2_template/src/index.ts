import express, {Application, NextFunction, Request, Response} from "express";
import path from "path";
import multer from "multer";
import bcrypt from "bcrypt";
import {Users} from "./db_connection";
import logger from "./logger"; // Logger utility for logging
import {Op} from "sequelize";

class App {
    private app: Application;
    private port: number;

    constructor(port: number) {
        this.app = express();
        this.port = port;

        this.initializeMiddleware(); // Initialize middleware handlers
        this.initializeRoutes(); // Set up routes
    }

    // Middleware initialization
    private initializeMiddleware(): void {
        // Log every incoming request with method and URL
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            logger.info(`Incoming Request: ${req.method} ${req.url}`);
            next(); // Proceed to next middleware or route
        });

        this.app.use(express.json()); // Parse JSON data in request body
        this.app.use(express.urlencoded({extended: true})); // Parse URL-encoded data

        // Serve static files from the client build directory
        this.app.use(express.static(path.resolve(__dirname, "../client/build")));
    }

    // Initialize routes for the application
    private initializeRoutes(): void {
        const upload = this.configureMulter(); // Configure multer for file uploads

        // Route for handling login requests
        this.app.post("/login", upload.single("idConfirmation"), AppController.handleLogin);
    }

    // Configures multer for file uploads
    private configureMulter(): multer.Multer {
        return multer({
            dest: path.resolve(__dirname, "../uploads"), // Destination directory for uploaded files
            fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
                logger.info("Processing file upload"); // Log file upload attempt

                const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]; // Allowed file types

                // Check if uploaded file type is allowed
                if (allowedTypes.includes(file.mimetype)) {
                    logger.info(`Valid file type: ${file.mimetype}`); // Log if file type is valid
                    cb(null, true); // Accept file
                } else {
                    logger.error(`Invalid file type uploaded: ${file.mimetype}`); // Log invalid file type
                    cb(new Error("Invalid file type")); // Reject file
                }
            },
        });
    }

    // Start the server on the defined port
    public start(): void {
        this.app.listen(this.port, () => {
            logger.info(`Server running on port ${this.port}`); // Log server start
        });
    }
}

class AppController {
    // Handle login route logic
    public static async handleLogin(req: Request, res: Response): Promise<void> {
        try {
            logger.info("Received request to '/login'"); // Log receipt of login request
            logger.info("File uploaded: " + JSON.stringify(req.file || {})); // Log the uploaded file details

            // Destructure incoming form data
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

            logger.info("Extracting form data"); // Log extraction of form data
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

            // Validate required fields
            logger.info("Validating input data for missing fields");
            if (!name || !address || !city || !phoneNumber || !postcode || !country || !username || !email || !password || !dateOfBirth) {
                logger.error("Validation failed: Missing required fields"); // Log validation error
                res.status(400).send({message: "Missing required fields"});
                return;
            }

            // Check if the user already exists in the database
            logger.info("Checking if user already exists in the database");
            const existingUser = await Users.findOne({
                where: {
                    [Op.or]: [
                        {email: {[Op.eq]: email.toLowerCase()}},
                        {username: {[Op.eq]: username}},
                    ],
                },
            });

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

            // Create salt for hashing password
            logger.info("Creating salt for password hashing");
            const salt = bcrypt.genSaltSync(10);

            // Hash the user's password
            logger.info("Hashing the user's password");
            const hashedPassword = bcrypt.hashSync(password, salt);

            // Save new user to the database
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

            if (newUser) {
                logger.info(`User '${username}' registered successfully`); // Log success registration
                res.status(200).send("OK"); // Send success response
                return;
            }
            if (!newUser) {
                logger.error(`Failed to register user '${username}'`); // Log registration failure
                res.status(500).send({message: "Failed to register user"}); // Send error response
                return;
            }
        } catch (error) {
            // Log any unexpected errors
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