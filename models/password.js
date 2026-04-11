import bcryptjs from "bcryptjs";

async function hash(password) {
  const rounds = getNumbersOfRounds();
  return await bcryptjs.hash(password, rounds);
}

function getNumbersOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
  //let rounds = 1;
  //if (process.env.NODE_ENV === 'production') {
  //    rounds = 14;
  //}
  //return rounds;
}

async function compare(provivedPassword, storedPassword) {
  return await bcryptjs.compare(provivedPassword, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
