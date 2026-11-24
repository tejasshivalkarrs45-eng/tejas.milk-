
require("dotenv").config({
    path: __dirname + "/.env"
});
const cors = require("cors");

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const crypto = require("crypto");

const app = express();

app.set("trust proxy", 1);
app.use(express.json());


app.use(cors({
    origin: true,
    credentials: true
}));

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
`dashboard_token=${token}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=43200`    );

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

// NEW SUPPLIER PERSONAL ID MODEL
const supplierProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    rate: {
        type: Number,
        required: true,
        min: 0
    },

openingBalance: {
    type: Number,
    default: 0,
    min: 0
},

    rateHistory: [{
        rate: {
            type: Number,
            required: true
        },
        effectiveFrom: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        default: "Active"
    }
}, {
    timestamps: true
});

const SupplierProfile = mongoose.models.SupplierProfile ||
    mongoose.model("SupplierProfile", supplierProfileSchema);

// DAILY MILK ENTRY MODEL
const milkEntrySchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SupplierProfile",
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    morning: {
        type: Number,
        default: 0,
        min: 0
    },
    evening: {
        type: Number,
        default: 0,
        min: 0
    },
    rate: {
        type: Number,
        required: true,
        min: 0
    },
    totalMilk: {
        type: Number,
        required: true,
        min: 0
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

const MilkEntry = mongoose.models.MilkEntry ||
    mongoose.model("MilkEntry", milkEntrySchema);

// SUPPLIER PAYMENT MODEL
const paymentSchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SupplierProfile",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0.01
    },
    date: {
        type: Date,
        default: Date.now
    },
    paymentMode: {
        type: String,
        default: "Cash"
    },
    note: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const Payment = mongoose.models.Payment ||
    mongoose.model("Payment", paymentSchema);

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

 // Delete Record
app.delete("/api/record/:id", requireDashboard, async (req, res) => {
    try {
        const deletedRecord = await Record.findByIdAndDelete(req.params.id);

        if (!deletedRecord) {
            return res.status(404).json({
                success: false,
                message: "Record नहीं मिला।"
            });
        }

        res.json({
            success: true,
            message: "Record सफलतापूर्वक Delete हो गया।"
        });

    } catch (err) {
        console.error("Record Delete Error:", err);

        res.status(500).json({
            success: false,
            message: "Record Delete Failed"
        });
    }
});

// Update Record
app.put("/api/record/:id", requireDashboard, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Record ID"
            });
        }

        const updatedRecord = await Record.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({
                success: false,
                message: "Record नहीं मिला।"
            });
        }

        res.json({
            success: true,
            message: "Record सफलतापूर्वक Update हो गया।",
            data: updatedRecord
        });

    } catch (err) {
        console.error("Record Update Error:", err);

        res.status(500).json({
            success: false,
            message: "Record Update Failed"
        });
    }
});

// CREATE SUPPLIER PERSONAL ID

// CREATE SUPPLIER PERSONAL ID
app.post("/api/supplier-profile", requireDashboard, async (req, res) => {
    try {
        const { name, mobile, email, rate, openingBalance } = req.body;

        if (!name || rate === undefined || rate === null || rate === "") {
            return res.status(400).json({
                success: false,
                message: "Supplier Name और Rate जरूरी हैं।"
            });
        }

        const supplierRate = Number(rate);
        const oldBalance = Number(openingBalance || 0);

        if (!Number.isFinite(supplierRate) || supplierRate < 0) {
            return res.status(400).json({
                success: false,
                message: "सही Rate दर्ज करें।"
            });
        }

        if (!Number.isFinite(oldBalance) || oldBalance < 0) {
            return res.status(400).json({
                success: false,
                message: "सही Opening Balance दर्ज करें।"
            });
        }

        const savedProfile = await SupplierProfile.create({
            name: name.trim(),
            mobile: String(mobile || "").trim(),
            email: String(email || "").trim(),
            rate: supplierRate,
            openingBalance: oldBalance,
            rateHistory: [{
                rate: supplierRate,
                effectiveFrom: new Date()
            }]
        });

        res.status(201).json({
            success: true,
            message: "Supplier Personal ID बन गई।",
            data: savedProfile
        });

    } catch (err) {
        console.error("Supplier Profile Error:", err);

        res.status(500).json({
            success: false,
            message: "Supplier Personal ID नहीं बन पाई।"
        });
    }
});

// GET SINGLE SUPPLIER PERSONAL ID
app.get("/api/supplier-profile/:id", requireDashboard, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Supplier ID सही नहीं है।"
            });
        }

        const supplier = await SupplierProfile.findById(id);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier नहीं मिला।"
            });
        }

        res.json({
            success: true,
            data: supplier
        });

    } catch (err) {
        console.error("Supplier Profile Error:", err);

        res.status(500).json({
            success: false,
            message: "Supplier की जानकारी लोड नहीं हुई।"
        });
    }
});

// GET ALL SUPPLIER PERSONAL IDs
app.get("/api/supplier-profile", requireDashboard, async (req, res) => {
    try {
        const profiles = await SupplierProfile.find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: profiles
        });

    } catch (err) {
        console.error("Supplier Profile Load Error:", err);

        res.status(500).json({
            success: false,
            message: "Supplier List Load नहीं हुई।"
        });
    }
});

// GET SUPPLIER MILK HISTORY
app.get("/api/milk-entry/:supplierId", requireDashboard, async (req, res) => {
    try {
        const { supplierId } = req.params;

        if (!mongoose.isValidObjectId(supplierId)) {
            return res.status(400).json({
                success: false,
                message: "Supplier ID सही नहीं है।"
            });
        }

        const supplier = await SupplierProfile.findById(supplierId);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier नहीं मिला।"
            });
        }

        const entries = await MilkEntry.find({
            supplierId: supplierId
        }).sort({ date: -1, createdAt: -1 });

        res.json({
            success: true,
            data: entries
        });

    } catch (err) {
        console.error("Milk History Error:", err);

        res.status(500).json({
            success: false,
            message: "Milk History लोड नहीं हुई।"
        });
    }
});


// SAVE DAILY MILK ENTRY
app.post("/api/milk-entry", requireDashboard, async (req, res) => {
    try {
        const { supplierId, morning, evening } = req.body;

        if (!mongoose.isValidObjectId(supplierId)) {
            return res.status(400).json({
                success: false,
                message: "Supplier ID सही नहीं है।"
            });
        }

        const supplier = await SupplierProfile.findById(supplierId);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier नहीं मिला।"
            });
        }

        const morningMilk = Number(morning);
        const eveningMilk = Number(evening);

        if (
            !Number.isFinite(morningMilk) ||
            !Number.isFinite(eveningMilk) ||
            morningMilk < 0 ||
            eveningMilk < 0 ||
            morningMilk + eveningMilk <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "सुबह या शाम का सही दूध दर्ज करें।"
            });
        }

        // Supplier ID से वर्तमान Rate लेना
        const currentRate = Number(supplier.rate);

        // कुल दूध और रकम अपने आप निकालना
        const totalMilk = morningMilk + eveningMilk;
        const amount = Number((totalMilk * currentRate).toFixed(2));

        const savedEntry = await MilkEntry.create({
            supplierId: supplier._id,
            date: new Date(),
            morning: morningMilk,
            evening: eveningMilk,
            rate: currentRate,
            totalMilk: totalMilk,
            amount: amount
        });

        res.status(201).json({
            success: true,
            message: "दूध की एंट्री सफलतापूर्वक सेव हो गई।",
            data: savedEntry
        });

    } catch (err) {
        console.error("Milk Entry Error:", err);

        res.status(500).json({
            success: false,
            message: "दूध की एंट्री सेव नहीं हुई।"
        });
    }
});

// UPDATE SUPPLIER OPENING BALANCE
app.put("/api/supplier-profile/:id/opening-balance", requireDashboard, async (req, res) => {
    try {
        const { id } = req.params;
        const openingBalance = Number(req.body.openingBalance);

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Supplier ID सही नहीं है।"
            });
        }

        if (
            req.body.openingBalance === undefined ||
            req.body.openingBalance === null ||
            req.body.openingBalance === "" ||
            !Number.isFinite(openingBalance) ||
            openingBalance < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "कृपया सही Opening Balance दर्ज करें।"
            });
        }

        const supplier = await SupplierProfile.findById(id);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier नहीं मिला।"
            });
        }

        supplier.openingBalance = openingBalance;
        await supplier.save();

        res.json({
            success: true,
            message: "Opening Balance सफलतापूर्वक Update हो गया।",
            data: supplier
        });

    } catch (err) {
        console.error("Opening Balance Update Error:", err);

        res.status(500).json({
            success: false,
            message: "Opening Balance Update नहीं हुआ।"
        });
    }
});


// UPDATE SUPPLIER RATE
app.put("/api/supplier-profile/:id/rate", requireDashboard, async (req, res) => {
    try {
        const { id } = req.params;
        const newRate = Number(req.body.rate);

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Supplier ID सही नहीं है।"
            });
        }

        if (
            req.body.rate === undefined ||
            req.body.rate === null ||
            req.body.rate === "" ||
            !Number.isFinite(newRate) ||
            newRate < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "कृपया सही नया Rate दर्ज करें।"
            });
        }

        const supplier = await SupplierProfile.findById(id);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier नहीं मिला।"
            });
        }

        supplier.rate = newRate;

        supplier.rateHistory.push({
            rate: newRate,
            effectiveFrom: new Date()
        });

        await supplier.save();

        res.json({
            success: true,
            message: "Supplier का नया Rate सफलतापूर्वक Update हो गया।",
            data: supplier
        });

    } catch (err) {
        console.error("Rate Update Error:", err);

        res.status(500).json({
            success: false,
            message: "Rate Update नहीं हुआ।"
        });
    }
});


// SAVE SUPPLIER PAYMENT

app.post("/api/payment", requireDashboard, async (req, res) => {
    try {
        const { supplierId, amount, paymentMode, note } = req.body;

        if (!mongoose.isValidObjectId(supplierId)) {
            return res.status(400).json({
                success: false,
                message: "Supplier ID सही नहीं है।"
            });
        }

        const paymentAmount = Number(amount);

        if (
            amount === undefined ||
            amount === null ||
            amount === "" ||
            !Number.isFinite(paymentAmount) ||
            paymentAmount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "कृपया सही Payment राशि दर्ज करें।"
            });
        }

        const supplier = await SupplierProfile.findById(supplierId);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier नहीं मिला।"
            });
        }

        const savedPayment = await Payment.create({
            supplierId: supplier._id,
            amount: paymentAmount,
            paymentMode: paymentMode || "Cash",
            note: note || "",
            date: new Date()
        });

        res.status(201).json({
            success: true,
            message: "Payment सफलतापूर्वक सेव हो गया।",
            data: savedPayment
        });

    } catch (err) {
        console.error("Payment Save Error:", err);

        res.status(500).json({
            success: false,
            message: "Payment सेव नहीं हुआ।"
        });
    }
});

// GET SUPPLIER PAYMENT HISTORY
app.get("/api/payment/:supplierId", requireDashboard, async (req, res) => {
    try {
        const { supplierId } = req.params;

        if (!mongoose.isValidObjectId(supplierId)) {
            return res.status(400).json({
                success: false,
                message: "Supplier ID सही नहीं है।"
            });
        }

        const supplier = await SupplierProfile.findById(supplierId);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier नहीं मिला।"
            });
        }

        const payments = await Payment.find({
            supplierId: supplierId
        }).sort({ date: -1, createdAt: -1 });

        res.json({
            success: true,
            data: payments
        });

    } catch (err) {
        console.error("Payment History Error:", err);

        res.status(500).json({
            success: false,
            message: "Payment History लोड नहीं हुई।"
        });
    }
});

// GET COMPLETE SUPPLIER ACCOUNT
app.get("/api/supplier-account/:supplierId", requireDashboard, async (req, res) => {
    try {
        const { supplierId } = req.params;

        if (!mongoose.isValidObjectId(supplierId)) {
            return res.status(400).json({
                success: false,
                message: "Supplier ID सही नहीं है।"
            });
        }

        const supplier = await SupplierProfile.findById(supplierId);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier नहीं मिला।"
            });
        }

        const [milkEntries, payments] = await Promise.all([
            MilkEntry.find({ supplierId }).sort({ date: -1 }),
            Payment.find({ supplierId }).sort({ date: -1 })
        ]);

        const totalMilk = milkEntries.reduce(
            (sum, item) => sum + Number(item.totalMilk || 0), 0
        );

        const totalAmount = milkEntries.reduce(
            (sum, item) => sum + Number(item.amount || 0), 0
        );

        const totalPaid = payments.reduce(
            (sum, item) => sum + Number(item.amount || 0), 0
        );

       const openingBalance = Number(supplier.openingBalance || 0);

const balance = Number(
    (openingBalance + totalAmount - totalPaid).toFixed(2)
);
        res.json({
            success: true,
            data: {
                supplier,
                openingBalance,
                totalMilk: Number(totalMilk.toFixed(2)),
                totalAmount: Number(totalAmount.toFixed(2)),
                totalPaid: Number(totalPaid.toFixed(2)),
                balance,
                milkEntries,
                payments
            }
        });

    } catch (err) {
        console.error("Supplier Account Error:", err);

        res.status(500).json({
            success: false,
            message: "Supplier का हिसाब लोड नहीं हुआ।"
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

// Delete Supplier
app.delete("/api/supplier/:id", requireDashboard, async (req, res) => {
    try {
        const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);

        if (!deletedSupplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier Record नहीं मिला।"
            });
        }

        res.json({
            success: true,
            message: "Supplier Record सफलतापूर्वक Delete हो गया।"
        });

    } catch (err) {
        console.error("Supplier Delete Error:", err);

        res.status(500).json({
            success: false,
            message: "Supplier Delete Failed"
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
