const keys = require('./keys');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const { Pool } = require('pg');
const pgClient = new Pool({
	user: keys.pgUser,
	host: keys.pgHost,
	database: keys.pgDatabase,
	password: keys.pgPassword,
	port: keys.pgPort,
});

pgClient.on('connect', () => {
	pgClient
		.query('CREATE TABLE IF NOT EXISTS values (number INT)')
		.catch((err) => console.log('Error while creating table:', err));
});

// Redis Client setup
const redis = require('redis');
const redisClient = redis.createClient({
	host: keys.redisHost,
	port: keys.redisPort,
	retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get('/', (req, res) => {
	res.send('Hi');
});

app.get('/values/all', async (req, res) => {
	const values = await pgClient.query('SELECT * FROM values');
	res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
	redisClient.hgetall('values', (err, values) => {
		if (err) {
			console.log('Error while retrieving values from redis', err);
		}
		res.send(values);
	});
});

app.post('/values', async (req, res) => {
	const index = parseInt(req.body.index);
	if (index > 40) {
		return res.status(422).send('Index greather than 40, Im lazy');
	}
	redisClient.hset('values', index, 'Nothing yet!');
	redisPublisher.publish('insert', index);
	pgClient
		.query('INSERT INTO values(number) VALUES($1)', [index])
		.catch((err) => console.log('Error while inserting in values table', err));

	res.status(200);
});

app.listen(5000, (err) => {
	console.log('Listening on port 5000');
});
