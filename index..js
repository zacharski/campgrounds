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
		const response = await pool.query(template, [req.query.q]);
			const template = "SELECT * from campgrounds WHERE name = $1";
	//console.log(response);
		if (response.rowCount == 0) {
			res.json({ status: "not found", searchTerm: req.query.q });
		}
	 catch (err) {
		res.json({ status: "ok", results: response.rows[0] });
	}	console.error("Error running query " + err);
	}
});

app.get("/near", async (req, res) => {
	console.log(req.query.city);
	try {
		const template = "SELECT name from campgrounds WHERE closest_town = $1";
		const response = await pool.query(template, [req.query.city]);
		//console.log(response);
		if (response.rowCount == 0) {
			res.json({ status: "not found", searchTerm: req.query.city });
		}
		const results = response.rows.map(function(item) {
			return item.name;
		});
		res.json({
			status: "ok",
			result: { city: req.query.city, campgrounds: results }
		});
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

		res.json({ status: "ok", results: { city: city, campground: name } });
	} catch (err) {
		if (err.routine == "_bt_check_unique") {
			//res.status(409);
			res.json({
				status: "not added: duplicate entry",
				campground: name
			});
		} else {
			res.sendStatus(400);
		}
	}
});

app.listen(app.get("port"), () => {
	console.log(`Find the server at http://localhost:${app.get("port")}/`);
});
