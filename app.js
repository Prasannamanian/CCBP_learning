const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("Server Running Successfully!");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// Get Players List API

app.get("/players/", async (request, response) => {
  const playerDetails = `
    SELECT
     player_id AS playerId,
     player_name AS playerName
    FROM player_details
    ORDER BY player_id;`;
  const players = await db.all(playerDetails);
  response.send(players);
});

// Get Player API

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = `
    SELECT
        player_id AS playerId,
        player_name AS playerName
    FROM 
        player_details
    WHERE
        player_id = ${playerId};`;
  const player = await db.get(playerDetails);
  response.send(player);
});

// Update Player API

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
    UPDATE
        player_details
    SET
        player_name = '${playerName}'
    WHERE
        player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// Get Match Details API

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT
        match_id AS matchId,
        match,
        year
    FROM
        match_details
    WHERE
        match_id = ${matchId};`;
  const matchDetails = await db.get(getMatchQuery);
  response.send(matchDetails);
});

// Get Matches of Player API

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchesQuery = `
    SELECT
        match_id AS matchId,
        match,
        year
    FROM
        match_details
        NATURAL JOIN player_match_score
    WHERE
        player_id = ${playerId}; `;
  const matchDetails = await db.all(getMatchesQuery);
  response.send(matchDetails);
});

// Get Players of Match API

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersQuery = `
    SELECT
        player_id AS playerId,
        player_name AS playerName
    FROM
        player_details
        NATURAL JOIN player_match_score
    WHERE
        match_id = ${matchId};`;
  const playerDetails = await db.all(getPlayersQuery);
  response.send(playerDetails);
});

// Get Player Statistics API

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getStatsQuery = `
   SELECT
        player_details.player_id AS playerId,
        player_details.player_name AS playerName,
        SUM(score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes
    FROM
        player_details
        INNER JOIN player_match_score
        ON player_details.player_id = player_match_score.player_id
    WHERE
        player_details.player_id = ${playerId};
 `;
  const playerDetails = await db.all(getStatsQuery);
  response.send(playerDetails);
});

module.exports = app;
