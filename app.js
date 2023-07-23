const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "userData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running Successfully");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//API1

app.post("/register", async (request, response) => {
  const { username, name, password, location, gender } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const getUserQuery = `
    SELECT username FROM user WHERE username = '${username}';`;
  const userFound = await db.get(getUserQuery);
  if (userFound === undefined) {
    const createUserQuery = `
        INSERT INTO user (username, name, password, gender, location)
        VALUES ('${username}','${name}','${hashedPassword}','${gender}','${location}');`;
    if (password.length < 5) {
      // Scenario 2
      response.status(400);
      response.send("Password is too short");
    } else {
      // Scenario 3
      const createUser = await db.run(createUserQuery);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    // Scenario 1
    response.status(400);
    response.send("User already exists");
  }
});

//API2

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const getUserDetails = `SELECT * FROM user WHERE username = '${username}';`;
  const userData = await db.get(getUserDetails);
  if (userData === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const is_password_match = await bcrypt.compare(password, userData.password);
    if (is_password_match) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

//API3

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const getUserData = `SELECT * FROM user WHERE username = '${username}';`;
  const userData = await db.get(getUserData);
  const is_current_match = await bcrypt.compare(oldPassword, userData.password);

  if (is_current_match) {
    if (newPassword.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatePasswordQuery = `UPDATE user SET password = '${hashedPassword}' WHERE username = '${username}';`;
      await db.run(updatePasswordQuery);
      response.status(200);
      response.send("Password updated");
    }
  } else {
    response.status(400);
    response.send("Invalid current password");
  }
});

module.exports = app;
