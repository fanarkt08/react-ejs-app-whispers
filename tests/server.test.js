import supertest from 'supertest'
import { app } from '../server'
import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { getById } from '../store'

const dbPath = join(process.cwd(), "db.json")

export const restoreDb = () => writeFileSync(dbPath, JSON.stringify([]))
export const populateDb = (data) => writeFileSync(dbPath, JSON.stringify(data))
const fixtures = [
  { id: 1, message: "test" },
  { id: 2, message: "Hello World" },
];

const inventedId = 12345;
const existingId = fixtures[0].id;

describe('Server', () => {
  beforeEach(() => populateDb(fixtures))
  afterAll(restoreDb)

  describe("GET /api/v1/whisper", () => {
    it("Should return an empty array when there's no data", async () => {
      await restoreDb()
      const response = await supertest(app).get("/api/v1/whisper")
      expect(response.status).toBe(200)
      expect(response.body).toEqual([])
    })

    it("Should return all the whispers", async () => {
      const response = await supertest(app).get("/api/v1/whisper")
      expect(response.status).toBe(200)
      expect(response.body).toEqual(fixtures)
    })
  })

  describe("GET /api/v1/whisper/:id", () => {
    it("Should return a 404 when the whisper doesn't exist", async () => {
      const response = await supertest(app).get(`/api/v1/whisper/${inventedId}`)
      expect(response.status).toBe(404)
    })

    it("Should return a whisper details", async () => {
      const response = await supertest(app).get(`/api/v1/whisper/${existingId}`)
      expect(response.status).toBe(200)
      expect(response.body).toEqual(fixtures.find(w => w.id === existingId))
    })
  })

  describe("POST /api/v1/whisper", () => {
    it("Should return a 400 when the body is empty", async () => {
      const response = await supertest(app).post("/api/v1/whisper").send({})
      expect(response.status).toBe(400)
    })

    it("Should return a 400 when the body is invalid", async () => {
      const response = await supertest(app).post("/api/v1/whisper").send({ foo: "bar" })
      expect(response.status).toBe(400)
    })

    it("Should return a 201 when the whisper is created", async () => {
      const newMessage = { message: "Hello test" }
      const response = await supertest(app).post("/api/v1/whisper").send(newMessage)

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        id: fixtures.length + 1,
        ...newMessage
      })

      const stored = await getById(response.body.id)
      expect(stored).toEqual(response.body)
    })
  })

  describe("PATCH /api/v1/whisper/:id", () => {
    it("Should return 404 when the whisper doesn't exist", async () => {
      const response = await supertest(app)
        .patch(`/api/v1/whisper/${inventedId}`)
        .send({ message: "updated" })
      expect(response.status).toBe(404)
    })

    it("Should return 204 when the whisper is updated", async () => {
      const response = await supertest(app)
        .patch(`/api/v1/whisper/${existingId}`)
        .send({ message: "updated" })

      expect(response.status).toBe(204)

      const updated = await getById(existingId)
      expect(updated).toEqual({ id: existingId, message: "updated" })
    })
  })

  describe("DELETE /api/v1/whisper/:id", () => {
    it("Should return 404 when the whisper doesn't exist", async () => {
      const response = await supertest(app).delete(`/api/v1/whisper/${inventedId}`)
      expect(response.status).toBe(404)
    })

    it("Should return 204 when the whisper is deleted", async () => {
      const response = await supertest(app).delete(`/api/v1/whisper/${existingId}`)
      expect(response.status).toBe(204)

      const remaining = await supertest(app).get("/api/v1/whisper")
      expect(remaining.body).toEqual(fixtures.filter(w => w.id !== existingId))
    })
  })
})
