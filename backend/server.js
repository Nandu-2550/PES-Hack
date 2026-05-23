const path = require("path");
const dotenv = require("dotenv");
const envPath = path.resolve(__dirname, "../.env");
const envResult = dotenv.config({ path: envPath, override: true });
if (envResult.error) {
  console.warn("[DEBUG] Failed to load root .env:", envResult.error);
} else {
  console.log("[DEBUG] Loaded env from", envPath);
}
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || "https://agrihub-blue.vercel.app";
const corsOrigins = process.env.NODE_ENV === 'production'
  ? [FRONTEND_URL]
  : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"];

// CORS for Express
app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server and same-origin requests (no origin)
    if (!origin) return callback(null, true);
    if (corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS policy violation: origin not allowed"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Init Socket.io
const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Pass io to request object for use in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

// Basic root route handler
app.get('/', (req, res) => res.send('AgriHub Backend API is running...'));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/equipment", require("./routes/equipment"));
app.use("/api/weather", require("./routes/weather"));
app.use("/api/diagnose", require("./routes/diagnose"));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/loans', require('./routes/loans'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
