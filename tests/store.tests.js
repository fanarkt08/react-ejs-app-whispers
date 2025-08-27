import { getAll, getById, create, updateById, deleteById } from "../store.js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach } from "node:test";

const dbPath = join(process.cwd(), "db.json");
const restoreDb = () => writeFileSync(dbPath, JSON.stringify([]));
const populateDb = (data) => writeFileSync(dbPath, JSON.stringify(data));
const fixtures = [
    { id: 1, message: "test" },
    { id: 2, message: "hello world" },
];
const inventedId = 12345;
const existingId = fixtures[0].id;
describe("store", () => {
    beforeEach(() => populateDb(fixtures));
    afterAll(restoreDb);
    // Here will be the tests
})