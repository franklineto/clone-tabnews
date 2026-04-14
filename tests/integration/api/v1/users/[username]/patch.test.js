import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/noncaseexistent",
        {
          method: "PATCH",
        },
      );
      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@gmail.com",
          password: "1234",
        }),
      });
      expect(user1Response.status).toBe(201);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@gmail.com",
          password: "1234",
        }),
      });
      expect(user2Response.status).toBe(201);

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });
      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      const email1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email1",
          email: "email1@gmail.com",
          password: "1234",
        }),
      });
      expect(email1Response.status).toBe(201);

      const email2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email2",
          email: "email2@gmail.com",
          password: "1234",
        }),
      });
      expect(email2Response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/email2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@gmail.com",
          }),
        },
      );
      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueUser1",
          email: "uniqueUser1@gmail.com",
          password: "1234",
        }),
      });
      expect(user1Response.status).toBe(201);

      const updateResponse = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );
      expect(updateResponse.status).toBe(200);

      const responseUpBody = await updateResponse.json();

      expect(responseUpBody).toEqual({
        id: responseUpBody.id,
        username: "uniqueUser2",
        email: "uniqueUser1@gmail.com",
        password: responseUpBody.password,
        created_at: responseUpBody.created_at,
        updated_at: responseUpBody.updated_at,
      });
      expect(uuidVersion(responseUpBody.id)).toBe(4);
      expect(Date.parse(responseUpBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseUpBody.updated_at)).not.toBeNaN();

      expect(responseUpBody.updated_at > responseUpBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueEmail1",
          email: "uniqueEmail1@gmail.com",
          password: "1234",
        }),
      });
      expect(user1Response.status).toBe(201);

      const updateResponse = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmail1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@gmail.com",
          }),
        },
      );
      expect(updateResponse.status).toBe(200);

      const responseUpBody = await updateResponse.json();

      expect(responseUpBody).toEqual({
        id: responseUpBody.id,
        username: "uniqueEmail1",
        email: "uniqueEmail2@gmail.com",
        password: responseUpBody.password,
        created_at: responseUpBody.created_at,
        updated_at: responseUpBody.updated_at,
      });
      expect(uuidVersion(responseUpBody.id)).toBe(4);
      expect(Date.parse(responseUpBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseUpBody.updated_at)).not.toBeNaN();

      expect(responseUpBody.updated_at > responseUpBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newPassword1",
          email: "newPassword1@gmail.com",
          password: "newPassword1",
        }),
      });
      expect(user1Response.status).toBe(201);

      const updateResponse = await fetch(
        "http://localhost:3000/api/v1/users/newPassword1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );
      expect(updateResponse.status).toBe(200);

      const responseUpBody = await updateResponse.json();

      expect(responseUpBody).toEqual({
        id: responseUpBody.id,
        username: "newPassword1",
        email: "newPassword1@gmail.com",
        password: responseUpBody.password,
        created_at: responseUpBody.created_at,
        updated_at: responseUpBody.updated_at,
      });
      expect(uuidVersion(responseUpBody.id)).toBe(4);
      expect(Date.parse(responseUpBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseUpBody.updated_at)).not.toBeNaN();

      expect(responseUpBody.updated_at > responseUpBody.created_at).toBe(true);
      console.log(responseUpBody);

      const userInDatabase = await user.findOneByUsername("newPassword1");
      const correctPasswordMatch = await password.compare(
        "newPassword2",
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "newPassword1",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
