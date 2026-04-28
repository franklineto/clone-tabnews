import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("Email incorreto e senha correta", async () => {
      await orchestrator.createUser({
        password: "senha-correta",
      });
      const response1 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.errado@gmail.com",
          password: "senha-correta",
        }),
      });

      expect(response1.status).toBe(401);
      const responseBody = await response1.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      });
    });

    test("Email correto e senha incorreta", async () => {
      await orchestrator.createUser({
        email: "email.certo@gmail.com",
      });
      const response1 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.certo@gmail.com",
          password: "senha-incorreta",
        }),
      });

      expect(response1.status).toBe(401);
      const responseBody = await response1.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      });
    });

    test("Email incorreto e senha incorreta", async () => {
      await orchestrator.createUser({});
      const response1 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.incorreto@gmail.com",
          password: "senha-incorreta",
        }),
      });

      expect(response1.status).toBe(401);
      const responseBody = await response1.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      });
    });

    test("Email correto e senha correta", async () => {
      const createdUser = await orchestrator.createUser({
        email: "email.correto@gmail.com",
        password: "senhacorreta",
      });
      const response1 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.correto@gmail.com",
          password: "senhacorreta",
        }),
      });

      expect(response1.status).toBe(201);
      const responseBody = await response1.json();
      //console.log(responseBody);
      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);
      //expect(expiresAt > createdAt);
      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);
      //console.log(expiresAt);
      //console.log(createdAt);
      //console.log((expiresAt - createdAt) / 1000 / 60 / 60 / 24);
      expect(expiresAt - createdAt).toBe(session.EXPIRATION_IN_MILLISECONDS);
    });
  });
});
