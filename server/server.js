
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const crypto = require("crypto");

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

// Active Dashboard Sessions
const activeSessions = new Map();

function getToken(req) {
    const cookie = req.headers.cookie || "";
    const match = cookie.match(/dashboard_token=([^;]+)/);
    return match ? match[1] : null;
}

function isValidSession(req) {
    const token = getToken(req);

    if (!token || !activeSessions.has(token)) {
        return false;
    }

    const expiresAt = activeSessions.get(token);

    if (Date.now() > expiresAt) {
        activeSessions.delete(token);
        return false;
    }

    return true;
}

function requireDashboard(req, res, next) {
    if (!isValidSession(req)) {
        return res.status(401).json({
            success: false,
            message: "Dashboard access required"
        });
    }

    next();
}

// Dashboard page protection
app.use("/dashboard", (req, res, next) => {
    if (!isValidSession(req)) {
        return res.redirect("/home/dashboard-login.html");
    }

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    next();
});

// Frontend files
app.use(express.static(path.join(__dirname, "..")));

// Open Login Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../index/login.html"));
});

// DASHBOARD PASSWORD LOGIN
app.post("/api/dashboard-login", (req, res) => {
    const enteredPassword = req.body.password;
    const correctPassword = process.env.DASHBOARD_PASSWORD;

    if (!correctPassword) {
        return res.status(500).json({
            success: false,
            message: "Dashboard password server पर सेट नहीं है।"
        });
    }

    if (enteredPassword !== correctPassword) {
        return res.status(401).json({
            success: false,
            message: "गलत पासवर्ड!"
        });
    }

    const token = crypto.randomBytes(32).toString("hex");

    // Session expires after 12 hours at the latest
    activeSessions.set(token, Date.now() + 12 * 60 * 60 * 1000);

    const secure = req.secure ? "; Secure" : "";

    res.setHeader(
        "Set-Cookie",
        `dashboard_token=${token}; HttpOnly; Path=/; SameSite=Lax${secure}`
    );

    res.json({
        success: true,
        message: "Dashboard Access Granted"
    });
});

// CHECK DASHBOARD SESSION
app.get("/api/dashboard-check", requireDashboard, (req, res) => {
    res.json({ success: true });
});

// AUTOMATIC DASHBOARD EXIT
app.post("/api/dashboard-exit", (req, res) => {
    const token = getToken(req);

    if (token) {
        activeSessions.delete(token);
    }

    res.setHeader(
        "Set-Cookie",
        "dashboard_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0" +
        (req.secure ? "; Secure" : "")
    );

    res.json({ success: true });
});

// MongoDB Schemas
const recordSchema = new mongoose.Schema({}, {
    strict: false,
    timestamps: true
});

const supplierSchema = new mongoose.Schema({}, {
    strict: false,
    timestamps: true
});

// MongoDB Models
const Record = mongoose.model("Record", recordSchema);
const Supplier = mongoose.model("Supplier", supplierSchema);

// RECORD SAVE
app.post("/api/record", requireDashboard, async (req, res) => {
    try {
        await Record.create(req.body);
        res.json({ message: "Record Saved" });
    } catch (err) {
        console.error("Record Error:", err);
        res.status(500).json({ message: "Record Save Failed" });
    }
});

// RECORD GET
app.get("/api/record", requireDashboard, async (req, res) => {
    try {
        const data = await Record.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        console.error("Record Error:", err);
        res.status(500).json({ message: "Record Load Failed" });
    }
});

// SUPPLIER SAVE
app.post("/api/supplier", requireDashboard, async (req, res) => {
    try {
        await Supplier.create(req.body);
        res.json({ message: "Supplier Saved" });
    } catch (err) {
        console.error("Supplier Error:", err);
        res.status(500).json({ message: "Supplier Save Failed" });
    }
});

// SUPPLIER GET
app.get("/api/supplier", requireDashboard, async (req, res) => {
    try {
        const data = await Supplier.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        console.error("Supplier Error:", err);
        res.status(500).json({ message: "Supplier Load Failed" });
    }
});

// SERVER + MONGODB CONNECTION
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "shivalkar_dairy"
        });

        console.log("MongoDB Connected Successfully!");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
}

startServer();
