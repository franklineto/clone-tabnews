import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado1",
          email: "duplicado@gmail.com",
          password: "1234",
        }),
      });

      expect(response1.status).toBe(201);
      const responseBody = await response1.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: responseBody.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("emailduplicado1");
      const correctPasswordMatch = await password.compare(
        "1234",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "12345",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicated 'email'", async () => {
      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado2",
          email: "Duplicado@gmail.com",
          password: "1234",
        }),
      });
      expect(response2.status).toBe(400);
      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'username'", async () => {
      const response3 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "EmailDuplicado1",
          email: "Duplicado3@gmail.com",
          password: "1234",
        }),
      });
      expect(response3.status).toBe(400);
      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para esta operação.",
        status_code: 400,
      });
    });
  });
});
