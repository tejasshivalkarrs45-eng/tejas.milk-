
require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const crypto = require("crypto");

const app = express();

app.set("trust proxy", 1);
app.use(express.json());

// Frontend files
app.use(express.static(path.join(__dirname, "..")));

// Dashboard sessions
const activeSessions = new Map();
const SESSION_DURATION = 12 * 60 * 60 * 1000;

// Cookie से Token निकालना
function getToken(req) {
    const cookie = req.headers.cookie || "";
    const match = cookie.match(/(?:^|;\s*)dashboard_token=([^;]+)/);
    return match ? match[1] : null;
}

// Session जाँचना
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

// Protected API
function requireDashboard(req, res, next) {
    if (!isValidSession(req)) {
        return res.status(401).json({
            success: false,
            message: "कृपया दोबारा Login करें।"
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

// Login page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../index/login.html"));
});

// Dashboard Login
app.post("/api/dashboard-login", (req, res) => {
    const enteredPassword = req.body.password;
    const correctPassword = process.env.DASHBOARD_PASSWORD;

    if (!correctPassword) {
        return res.status(500).json({
            success: false,
            message: "Server पर Dashboard Password सेट नहीं है।"
        });
    }

    if (enteredPassword !== correctPassword) {
        return res.status(401).json({
            success: false,
            message: "गलत पासवर्ड!"
        });
    }

    const token = crypto.randomBytes(32).toString("hex");

    activeSessions.set(
        token,
        Date.now() + SESSION_DURATION
    );

    const secureCookie =
        process.env.NODE_ENV === "production" ? "; Secure" : "";

    res.setHeader(
        "Set-Cookie",
        `dashboard_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=43200${secureCookie}`
    );

    res.json({
        success: true,
        message: "Login सफल!"
    });
});

// Dashboard Session Check
app.get("/api/dashboard-check", requireDashboard, (req, res) => {
    res.json({ success: true });
});

// Dashboard Logout
app.post("/api/dashboard-exit", (req, res) => {
    const token = getToken(req);

    if (token) {
        activeSessions.delete(token);
    }

    const secureCookie =
        process.env.NODE_ENV === "production" ? "; Secure" : "";

    res.setHeader(
        "Set-Cookie",
        `dashboard_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secureCookie}`
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
const Record = mongoose.models.Record ||
    mongoose.model("Record", recordSchema);

const Supplier = mongoose.models.Supplier ||
    mongoose.model("Supplier", supplierSchema);

// Save Record
app.post("/api/record", requireDashboard, async (req, res) => {
    try {
        const savedRecord = await Record.create(req.body);

        res.json({
            success: true,
            message: "Record Saved",
            data: savedRecord
        });
    } catch (err) {
        console.error("Record Error:", err);

        res.status(500).json({
            success: false,
            message: "Record Save Failed"
        });
    }
});

// Get Records
app.get("/api/record", requireDashboard, async (req, res) => {
    try {
        const data = await Record.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        console.error("Record Error:", err);

        res.status(500).json({
            success: false,
            message: "Record Load Failed"
        });
    }
});

// Save Supplier
app.post("/api/supplier", requireDashboard, async (req, res) => {
    try {
        const savedSupplier = await Supplier.create(req.body);

        res.json({
            success: true,
            message: "Supplier Saved",
            data: savedSupplier
        });
    } catch (err) {
        console.error("Supplier Error:", err);

        res.status(500).json({
            success: false,
            message: "Supplier Save Failed"
        });
    }
});

// Get Suppliers
app.get("/api/supplier", requireDashboard, async (req, res) => {
    try {
        const data = await Supplier.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        console.error("Supplier Error:", err);

        res.status(500).json({
            success: false,
            message: "Supplier Load Failed"
        });
    }
});

// Start Server
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
