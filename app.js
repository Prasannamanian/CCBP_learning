const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initiateDbAndServer = async () => {
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

initiateDbAndServer();

//Convert response names

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directName: dbObject.director_name,
  };
};

// Get Movies List API

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
   SELECT 
    movie_name AS movieName
   FROM
    movie;`;
  const moviesList = await db.all(getMoviesQuery);
  response.send(moviesList);
});

// Get Directors List API

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
   SELECT 
    director_id AS directorId,
    director_name AS directorName
   FROM
    director;`;
  const directorsList = await db.all(getDirectorsQuery);
  response.send(directorsList);
});

// Add Movie API

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
        movie(director_id,
        movie_name,
        lead_actor)
    VALUES
        (${directorId},
        '${movieName}',
        '${leadActor}');`;

  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// Get Movie API

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT
    *
  FROM
    movie
  WHERE
    movie_id = ${movieId};`;

  const movieDetails = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movieDetails));
});

// Get Director's Movie List API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
   SELECT 
    movie_name As movieName
   FROM
    movie
   NATURAL JOIN
    director
   WHERE
    director_id = ${directorId};`;
  const directorMovieList = await db.all(getDirectorMovieQuery);
  response.send(directorMovieList);
});

// Update Movie API

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE
        movie
    SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE
        movie_id = ${movieId};
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// Delete Movie API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE
    FROM
        movie
    WHERE
        movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

module.exports = app;
