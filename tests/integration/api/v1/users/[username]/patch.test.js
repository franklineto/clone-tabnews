// tests/integration/api/v1/users/patch.test.js
// TESTE DE INTEGRAÇÃO: Edição de Pessoas (PATCH /api/users/:id)
// Testa todos os cenários de atualização:
//   - Retornar 404 para ID inexistente

//   - Atualizar campos de PF com sucesso
//   - Atualizar campos de PJ com sucesso
//   - Atualizar apenas alguns campos (parcial)
//   - Rejeitar dados inválidos

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
    // ============================================================
    // TESTES: PATCH - Casos de erro
    // ============================================================
    test("deve retornar 404 ao tentar atualizar uma pessoa inexistente", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/pessoaInexistente",
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

    test("deve retornar 400 ao tentar atualizar um username para um já existente", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      await orchestrator.createUser({
        username: "user2",
      });

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

    test("deve retornar 400 ao tentar atualizar um email para um já existente", async () => {
      await orchestrator.createUser({
        email: "email1@gmail.com",
      });
      const createdUser2 = await orchestrator.createUser({
        email: "email2@gmail.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
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
      //console.log(responseUpBody);

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
