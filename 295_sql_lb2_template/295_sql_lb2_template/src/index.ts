import express, {Application, Request, Response} from "express";
import path from "path";
import multer from "multer";
import bcrypt from "bcrypt";
import {Users} from "./db_connection"; // Assuming this exists
import logger from "./logger";
import {Op} from "sequelize";

const app: Application = express();
const port = 3002;

// Configure multer for file uploads
const upload = multer({
    dest: "uploads/",
    fileFilter: (req, file, cb) => {
        logger.info("Processing file upload");
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        if (allowedTypes.includes(file.mimetype)) {
            logger.info(`Valid file type: ${file.mimetype}`);
            cb(null, true);
        } else {
            logger.error(`Invalid file type uploaded: ${file.mimetype}`);
            cb(new Error("Invalid file type"));
        }
    },
});

// Middleware to parse JSON and URL-encoded form data
app.use((req, res, next) => {
    logger.info(`Incoming Request: ${req.method} ${req.url}`);
    next();
});
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Serve static files
app.use(express.static(path.resolve(__dirname, "../client/build")));

app.post("/login", upload.single("idConfirmation"), (req: Request, res: Response) => {
    (async () => {
        try {
            logger.info("Received request to '/login'");
            // Log incoming data for debugging
            logger.info("File uploaded: " + JSON.stringify(req.file || {}));

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
                dateOfBirth,
            } = req.body;

            // Log extracted data
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

            // Check for missing fields
            logger.info("Validating input data for missing fields");
            if (!name || !address || !city || !phoneNumber || !postcode || !country || !username || !email || !password || !dateOfBirth) {
                logger.error("Validation failed: Missing required fields");
                return res.status(400).json({message: "Missing required fields"});
            }

            logger.info("Checking if user already exists in the database");
            const existingUser = await Users.findOne({
                where: {
                    [Op.or]: [{username}, {email}],
                },
            });
            if (existingUser) {
                logger.warn(`User with username '${username}' or email '${email}' already exists`);
                return res.status(400).json({message: "User already exists"});
            }

            logger.info("Creating salt for password hashing");
            const salt = bcrypt.genSaltSync(10);
            logger.info("Hashing the user's password");
            const hashedPassword = bcrypt.hashSync(password, salt);

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
                logger.info(`User '${username}' registered successfully`);
            } else {
                logger.error(`Failed to register user '${username}'`);
                return res.status(500).json({message: "Failed to register user"});
            }

            logger.info("Responding with success after user creation");
            res.status(200).send("OK");
        } catch (error) {
            logger.error(`Error occurred while processing '/login': ${error instanceof Error ? error.message : "Unknown error"}`);
            res.status(500).json({
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    })();
});

app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});