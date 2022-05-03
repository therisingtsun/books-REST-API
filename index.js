const express = require('express');
const { writeFile } = require('fs/promises');
const { v4 } = require('uuid');
const open = require('open');

const app = express();
const port = 8000;

const registryPath = './db/registry.json';
const registry = require(registryPath);

function updateRegistry(r) {
	return writeFile(registryPath, JSON.stringify(r, null, '\t'), 'utf-8');
}

app
	.use(express.static('public'))
	.use(express.static('db/covers'))
	.use(express.json())
	.use(express.urlencoded({ extended: true }))

	.get('/api/list', (req, res) => {
		res.send(registry);
	})
	.get('/api/get/:id', (req, res) => {
		const id = req.params.id;
		res.send(registry[id] ?? false);
	})
	
	.post('/api/new', async (req, res) => {
		const book = req.body;
		let id;
		while (registry[id = v4()]) {}
		book.id = id;
		registry[id] = book;
		await updateRegistry(registry);
		res.redirect(`/?id=${id}`)
	})
	.post('/api/edit', async (req, res) => {
		registry[req.body.id] = req.body;
		await updateRegistry(registry);
		res.redirect(`/?id=${req.body.id}`);
	})
	.post('/api/delete', async (req, res) => {
		delete registry[req.body.id];
		await updateRegistry(registry);
		res.redirect(`/`);
	})

	.get('*', (req, res) => {
		res.redirect('./404.html');
	})
	
	.listen(port, () => {
		console.log(`App listening on port ${port}`);
	});

open(`http://localhost:${port}`);