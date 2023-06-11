const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("Server Running Successfully!!");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// Get Player API

app.get("/players/", async (request, response) => {
  const playerDetails = `
    SELECT * FROM cricket_team
    ORDER BY player_id;`;
  const players = await db.all(playerDetails);
  response.send(
    players.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

// ADD Player API

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const postQuery = `
    INSERT INTO cricket_team(player_name, jersey_number,role)
    VALUES (
        '${playerName}',
        ${jerseyNumber},
        '${role}',
    );`;
  const dbResponse = await db.run(postQuery);
  response.send("Player Added to Team");
});
