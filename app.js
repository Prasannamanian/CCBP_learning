const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

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

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    population: dbObject.population,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

// Get State List API

app.get("/states/", async (request, response) => {
  const statesQuery = `
    SELECT 
        *
    FROM
        state;`;

  const statesList = await db.all(statesQuery);
  response.send(
    statesList.map((eachState) => convertDbObjectToResponseObject(eachState))
  );
});

// Get State API

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT
        *
    FROM
        state
    WHERE
        state_id = ${stateId};`;

  const stateDetails = await db.get(getStateQuery);
  response.send(convertDbObjectToResponseObject(stateDetails));
});

// Create District API

app.post("/districts/", async (request, response) => {
  const distDetails = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = distDetails;
  const addDistQuery = `
  INSERT INTO
    district (district_name, state_id, cases, cured, active, deaths)
  VALUES
    ('${districtName}',
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths});`;

  await db.run(addDistQuery);
  response.send("District Successfully Added");
});

// Get District API

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistQuery = `
    SELECT
        *
    FROM
        district
    WHERE
        district_id = ${districtId};`;

  const distDetails = await db.get(getDistQuery);
  response.send(convertDbObjectToResponseObject(distDetails));
});

// Delete District API

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `
    DELETE FROM
        district
    WHERE
        district_id = ${districtId};`;

  await db.run(deleteQuery);
  response.send("District Removed");
});

// Update District API

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const distDetails = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = distDetails;
  const updateDistQuery = `
  UPDATE
    district 
  SET
    district_name = '${districtName}',
       state_id = ${stateId},
       cases = ${cases},
       cured = ${cured},
       active = ${active},
       deaths= ${deaths}
  WHERE
    district_id = ${districtId};`;

  await db.run(updateDistQuery);
  response.send("District Details Updated");
});

module.exports = app;
