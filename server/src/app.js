import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import session from "express-session";
import { createServer } from "http";
import passport from "passport";
import requestIp from "request-ip";
import { Server } from "socket.io";
import { ApiError } from "./utils/ApiError.js";

const app = express();

const httpServer = createServer(app);

const allowedOrigins = process.env.CORS_ORIGIN.split(",");

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: corsOptions,
});

app.set("io", io); // using set method to mount the `io` instance on the app to avoid usage of `global`

// global middlewares
app.use(cors(corsOptions));

app.use(requestIp.mw());

// Rate limiter to avoid misuse of the service and avoid cost spikes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

// required for passport
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.set("trust proxy", true);

// Define __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../../", "client", "dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../", "client", "dist", "index.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "../../", "client", "dist", "index.html"));
});

// api routes
import { errorHandler } from "./middlewares/error.middlewares.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import publicRouter from "./routes/public.routes.js";

// * Public routes

// * App routes
import userRouter from "./routes/apps/auth/restaurant.routes.js";

//Manage Restaurant routes

import tableRouter from "./routes/apps/manageRestaurant/table.routes.js";
import menuRouter from "./routes/apps/manageRestaurant/menu.routes.js";
import customerRouter from "./routes/apps/manageRestaurant/customer.routes.js";
import orderRouter from "./routes/apps/manageRestaurant/order.routes.js";
import billRouter from "./routes/apps/manageRestaurant/bill.routes.js";
import restaurantAdmin from "./routes/apps/auth/restaurantAdmin.routes.js";
import superAdminRouter from "./routes/superAdmin.routes.js";
import taxRouter from "./routes/apps/manageRestaurant/tax.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { initializeSocketIO } from "./socket/index.js";

// * healthcheck
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/public", publicRouter);

// * App apis
app.use("/api/v1/users", userRouter);

// Manage Restaurant apis

app.use("/api/v1/tables", tableRouter);
app.use("/api/v1/menus", menuRouter);
app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/bills", billRouter);
app.use("/api/v1/admin", restaurantAdmin);
app.use("/api/v1/superAdmin", superAdminRouter);
app.use("/api/v1/admin/taxes", taxRouter);

initializeSocketIO(io);

app.use(errorHandler);

export { httpServer };
