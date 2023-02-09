import app from "../src/app";
import supertest from "supertest";
import httpStatus from "http-status";
import { createConsole } from "./factories/console.factory";
import { cleanDb, disconnectDb } from "./helpers";
import { faker } from "@faker-js/faker";
import prisma from "config/database";

const server = supertest(app);

beforeEach(async () => {
    await cleanDb();
});
  
afterAll(async () => {
    await disconnectDb();
});

describe("GET/ consoles", () => {
    it("Should respond with status 200 and empty array when table is empty", async () => {
        const console = await server.get("/consoles");

        expect(console.status).toBe(httpStatus.OK);
        expect(console.body).toHaveLength(0);
    });

    it("Sould respond with status 200 and console data", async () => {
        const console = await createConsole();

        const result  = await server.get("/consoles");

        expect(result.status).toBe(httpStatus.OK);
        expect(result.body).toEqual([{
            id: console.id,
            name: console.name  
        }])
    });
});

describe("GET /consoles/:id", () => {
    it("Should respond with status 404 when consoleId is not valid", async () => {
      const console = await server.get("/consoles/0");

      expect(console.status).toBe(httpStatus.NOT_FOUND);
    });
  
    it("Should respond with status 200 and with console data", async () => {
      const console = await createConsole();
  
      const result = await server.get(`/consoles/${console.id}`);

      expect(result.status).toBe(httpStatus.OK);
      expect(result.body).toEqual({
        id: console.id,
        name: console.name,
      });
    });
});

describe("POST /consoles", () => {
    it("Should respond with status 422 when body is not valid", async () => {
        const result = await server.post("/consoles").send({
        invalidBody: "invalidBody",
      });

      expect(result.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
    });

    it("Should respond with status 409 when console exist", async () => {
        const console = await createConsole();

        const result = await server.post("/consoles").send({
          name: console.name,
        });

        expect(result.status).toBe(httpStatus.CONFLICT);
      });

      it("Should respond with status 201 and create a new console", async () => {
        const name = faker.name.jobDescriptor();

        const result = await server.post("/consoles").send({
          name: name
        });
        
        const console = await prisma.console.findUnique({
            where: {
                name: name
            },
        });

        expect(result.status).toBe(httpStatus.CREATED);
        expect(console).toEqual({
          id: console.id,
          name: name
        });
    })
})