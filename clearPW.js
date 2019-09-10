const express = require("express");

const app = express();

const argon2 = require("argon2");

const bodyParser = require("body-parser");
app.use(bodyParser.json({ type: "application/json" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("port", 8080);
const Pool = require("pg").Pool;
const config = {
  host: "localhost",
  user: "parky",
  password: "mItithaWFAnC",
  database: "parky"
};

const pool = new Pool(config);

app.post("/login", async (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const password = req.body.password;
  try {
    const query = "SELECT password FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);
    if (result.rowCount == 1) {
      if (await argon2.verify(result.rows[0].password, password)) {
        res.json("Log In Successful");
      } else {
        res.json("Password Incorrect");
      }
    } else {
      res.json("Username not found");
    }
  } catch (err) {
    console.log("ERROR " + err);
  }
});

app.post("/create", async (req, res) => {
  let hash;
  const username = req.body.username;
  const password = req.body.password;
  try {
    const hash = await argon2.hash(password);
    const query = "INSERT INTO users (username, password) VALUES ($1, $2)";
    const result = await pool.query(query, [username, hash]);
    //console.log(result);
    if (result.rowCount == 1) {
      res.json("User created");
    } else {
      res.json("User not created");
    }
  } catch (err) {
    console.log("ERROR " + err);
    if (err.message.search("duplicate") != -1) {
      res.json("Username taken");
    }
  }
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`);
});
