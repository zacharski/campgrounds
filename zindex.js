const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("port", 8080);

app.use(bodyParser.json({ type: "application/json" }));
app.use(bodyParser.urlencoded({ extended: true }));

var Pool = require("pg").Pool;
var config = {
	host: "localhost",
	user: "parky",
	password: "parky",
	database: "parky"
};

var pool = new Pool(config);

app.get("/info", async (req, res) => {
	console.log(req.query.q);
	try {
		const template = "SELECT * from campgrounds WHERE name = $1";
		const response = await pool.query(template, [
			req.query.q.split(" ")[0]
		]);
		//console.log(response);
		if (response.rowCount == 0) {
			res.sendStatus(404);
		}
		res.json(response.rows[0]);
	} catch (err) {
		console.error("Error running query " + err);
	}
});

app.get("/near", async (req, res) => {
	console.log(req.query.city);
	try {
		const template = "SELECT name from campgrounds WHERE closest_town = $1";
		const response = await pool.query(template, [req.query.city]);
		//console.log(response);
		if (response.rowCount == 0) {
			res.sendStatus(404);
		}
		const results = response.rows.map(function(item) {
			return item.name;
		});
		res.json({ city: req.query.city, campgrounds: response.rows });
	} catch (err) {
		console.error("Error running query " + err);
	}
});

app.get("/hello", (req, res) => {
	res.json("Hello World!");
});

app.get("/vacancy", (req, res) => {
	console.log(req.query);
	const campground = req.query.q;
	if (campground == "Saddle") {
		res.json({ campground: campground, sites: 5 });
	} else {
		res.json({ campground: campground, sites: 0 });
	}
});

app.post("/add", async (req, res) => {
	const name = req.body.name;
	const city = req.body.city;
	const description = req.body.description;
	const toilets = req.body.toilets;
	const query =
		"INSERT INTO campgrounds (name, closest_town, description, restrooms) VALUES ($1, $2, $3, $4)";
	try {
		const response = await pool.query(query, [
			name,
			city,
			description,
			toilets
		]);
		console.log(response);

		res.json({ city: city, campground: name });
	} catch (err) {
		if (err.routine == "_bt_check_unique") {
			res.status(409);
			res.send("Duplicate entry");
		} else {
			res.sendStatus(400);
		}
	}
});

app.listen(app.get("port"), () => {
	console.log(`Find the server at http://localhost:${app.get("port")}/`);
});
