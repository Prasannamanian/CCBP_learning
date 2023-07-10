const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
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

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `
    SELECT
        *
    FROM
        todo
    WHERE
        id = ${todoId};`;
  const data = await db.get(getQuery);
  response.send(data);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const putQuery = `
    INSERT INTO todo (id, 'todo', 'priority', 'status')
    VALUES (${id},'${todo}','${priority}','${status}');`;
  await db.run(putQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  let putQuery = "";
  let updatedTodo = "";

  if (status !== undefined) {
    putQuery = `
    UPDATE 
        todo 
    SET
        status = '${status}'
    WHERE 
        id = ${todoId};`;
    updatedTodo = "Status";
  } else if (priority !== undefined) {
    putQuery = `
    UPDATE 
        todo 
    SET
        priority = '${priority}'
    WHERE
        id = ${todoId};`;
    updatedTodo = "Priority";
  } else if (todo !== undefined) {
    putQuery = `
    UPDATE 
        todo 
    SET 
        todo = '${todo}'
    WHERE
        id = ${todoId};`;
    updatedTodo = "Todo";
  }

  await db.run(putQuery);
  response.send(`${updatedTodo} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM
        todo
    WHERE
        id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
