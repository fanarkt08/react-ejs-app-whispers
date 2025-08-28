import express from "express";
import bodyParser from "body-parser";
import { getAll, getById, create, updateById, deleteById } from './store.js'

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.get('/about', async (req, res) => {
  const whispers = await getAll();
  res.render('about', { whispers });
});

app.get('/api/v1/whisper', async (req, res) => {
  const whispers = await getAll();
  res.json(whispers);
});

app.get("/api/v1/whisper/:id", async (req, res) => {
  const id = Number(req.params.id);
  const whisper = await getById(id);
  if (!whisper) {
    return res.sendStatus(404);
  }
  res.json(whisper);
});

app.post("/api/v1/whisper", async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.sendStatus(400);
  }
  const newWhisper = await create(message);
  res.status(201).json(newWhisper);
});

app.patch("/api/v1/whisper/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.sendStatus(400);
  }

  const existing = await getById(id);
  if (!existing) {
    return res.sendStatus(404);
  }

  await updateById(id, message);
  res.sendStatus(204);
});

app.delete("/api/v1/whisper/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await getById(id);
  if (!existing) {
    return res.sendStatus(404);
  }

  await deleteById(id);
  res.sendStatus(204);
});

export { app };
