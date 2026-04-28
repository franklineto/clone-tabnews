import controller from "infra/controller.js";
import { createRouter } from "next-connect";
import authentication from "models/authentication.js";
import session from "models/session.js";
//import { UnauthorizedError } from "infra/errors.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticateUser = await authentication.getAuthenticateUser(
    userInputValues.email,
    userInputValues.password,
  );
  //console.log(authenticateUser);

  const newSession = await session.create(authenticateUser.id);

  response.setHeader("Set-Cookie", `session_id=${newSession.token}`);
  //console.log(newSession);
  return response.status(201).json(newSession);
}
