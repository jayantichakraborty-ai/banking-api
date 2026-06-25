const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const dbPath = path.join(__dirname, "db.json");
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Helper: read db
function readDb() {
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

// Helper: write db
function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// ============================================
//  ACCOUNTS ROUTES
// ============================================

app.get("/accounts", (req, res) => {
  const db = readDb();
  let results = db.accounts;

  if (req.query.account_name) {
    results = results.filter((a) =>
      a.account_name.toLowerCase().includes(req.query.account_name.toLowerCase())
    );
  }
  if (req.query.account_type) {
    results = results.filter(
      (a) => a.account_type.toLowerCase() === req.query.account_type.toLowerCase()
    );
  }
  if (req.query.account_id) {
    results = results.filter((a) => a.account_id === req.query.account_id);
  }

  res.json(results);
});

app.get("/accounts/:account_id", (req, res) => {
  const db = readDb();
  const account = db.accounts.find((a) => a.account_id === req.params.account_id);

  if (account) {
    res.json(account);
  } else {
    res.status(404).json({ error: "Account not found" });
  }
});

app.post("/accounts", (req, res) => {
  const db = readDb();
  const newAccount = {
    id: db.accounts.length > 0 ? Math.max(...db.accounts.map((a) => a.id)) + 1 : 1,
    account_id: req.body.account_id || String(1000 + db.accounts.length + 1),
    account_name: req.body.account_name || "New Account",
    account_type: req.body.account_type || "savings",
    balance: req.body.balance || "0",
  };

  db.accounts.push(newAccount);
  writeDb(db);
  res.status(201).json(newAccount);
});

app.put("/accounts/:account_id", (req, res) => {
  const db = readDb();
  const index = db.accounts.findIndex((a) => a.account_id === req.params.account_id);

  if (index === -1) {
    return res.status(404).json({ error: "Account not found" });
  }

  db.accounts[index] = {
    ...db.accounts[index],
    ...req.body,
    id: db.accounts[index].id,
    account_id: db.accounts[index].account_id,
  };

  writeDb(db);
  res.json(db.accounts[index]);
});

app.delete("/accounts/:account_id", (req, res) => {
  const db = readDb();
  const index = db.accounts.findIndex((a) => a.account_id === req.params.account_id);

  if (index === -1) {
    return res.status(404).json({ error: "Account not found" });
  }

  const deleted = db.accounts.splice(index, 1);
  writeDb(db);
  res.json({ message: "Account deleted", account: deleted[0] });
});

// ============================================
//  ROOT
// ============================================
app.get("/", (req, res) => {
  res.json({
    message: "Kore.ai Mock API Server",
    endpoints: {
      list_all: "GET /accounts",
      path_param: "GET /accounts/1001",
      query_by_name: "GET /accounts?account_name=Jane",
      query_by_type: "GET /accounts?account_type=savings",
    },
  });
});

// ============================================
//  Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`Mock API Server is running on port ${PORT}`);
  console.log(`\n  GET    /accounts                      - List all accounts`);
  console.log(`  GET    /accounts/:account_id           - Get by ID`);
  console.log(`  GET    /accounts?account_name=Jane     - Filter by name`);
  console.log(`  GET    /accounts?account_type=savings  - Filter by type`);
  console.log(`  POST   /accounts                      - Create account`);
  console.log(`  PUT    /accounts/:account_id           - Update account`);
  console.log(`  DELETE /accounts/:account_id           - Delete account`);
});

