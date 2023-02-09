import app from "../src/app";
import supertest from "supertest";
import httpStatus from "http-status";
import { createGames } from "./factories/games.factory";
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

describe("GET/ games", () => {
  it("Should respond with status 200 has no games and empty array when table is empty", async () => {
    const games = await server.get("/games");

    expect(games.status).toBe(httpStatus.OK);
    expect(games.body).toHaveLength(0);
  });

  it("Should respond with status 200 has games and send games data", async () => {
    const console = await createConsole();
    const createGame = await createGames(console.id);
    const games = await server.get("/games");

    expect(games.status).toBe(httpStatus.OK);
    expect(games.body).toEqual([
      {
        id: createGame.id,
        title: createGame.title,
        consoleId: createGame.consoleId,
        Console: {
          id: console.id,
          name: console.name
        }
      },
    ]);
  })
});

describe("GET/ games/:id", () => {
  it("Should respond with status 404 when gameId is not valid", async () => {
    const game = await server.get("/games/0");

    expect(game.status).toBe(httpStatus.NOT_FOUND);
  });

  it("Should respond with status 200 and game id data", async () => {
    const console = await createConsole();
    const createGame = await createGames(console.id);

    const game = await server.get(`/games/${createGame.id}`);

    expect(game.status).toBe(httpStatus.OK);
    expect(game.body).toEqual(
      {
        consoleId: console.id,
        id: createGame.id,
        title: createGame.title
      },
    );
  })
});

describe("POST/ games", () => {
  it("Should respond with status 422 when body is not valid", async () => {
    const result = await server.post("/games").send({
      invalidBody: "invalidBody",
    });

    expect(result.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
  });

  it("Should respond with status 409 when game exist", async () => {
    const console = await createConsole();
    const createGame = await createGames(console.id);

    const result = await server.post("/games").send({
      consoleId: createGame.consoleId,
      title: createGame.title
    });

    expect(result.status).toBe(httpStatus.CONFLICT);
  });

  it("Should respond with status 201 and create a new game", async () => {
    const title = faker.name.jobDescriptor();
    const console = await createConsole();

    const result = await server.post("/games").send({
      title: title,
      consoleId: console.id
    });

    const game = await prisma.game.findUnique({
      where: {
        title: title
      }
    });

    expect(result.status).toBe(httpStatus.CREATED);
    expect(game).toEqual({
      consoleId: console.id,
      id: game.id,
      title: title
    });
  });
})