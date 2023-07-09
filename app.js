const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running Successfully!!!");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/todos/", async (request, response) => {
  let { status, search_q, priority } = request.query;
  let getQuery = "";
  if (search_q === undefined) {
    search_q = "";
    if (priority === undefined) {
      getQuery = `
        SELECT *
        FROM
            todo
        WHERE todo LIKE '%${search_q}%'
        AND status = '${status}';`;
    } else if (status === undefined) {
      getQuery = `
        SELECT *
        FROM
            todo
        WHERE todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
    } else if (priority !== undefined && status !== undefined) {
      getQuery = `
        SELECT *
        FROM
            todo
        WHERE todo LIKE '%${search_q}%'
        AND priority = '${priority}'
        AND status = '${status}';`;
    }
  } else {
    getQuery = `
        SELECT *
        FROM
            todo
        WHERE todo LIKE '%${search_q}%';`;
  }

  const data = await db.all(getQuery);
  response.send(data);
});

module.exports = app;
