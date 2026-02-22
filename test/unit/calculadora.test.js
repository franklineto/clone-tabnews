const calculadora = require("../../models/calculadora.js");

test("somar 5 + 5 deveria retornar 10", () => {
  const resultado = calculadora.somar(5, 5);
  expect(resultado).toBe(10);
});

test("somar 5 + 105 deveria retornar 110", () => {
  const resultado = calculadora.somar(5, 105);
  expect(resultado).toBe(110);
});

test("somar 'banana' + 5 deveria retornar Erro", () => {
  const resultado = calculadora.somar("banana", 5);
  expect(resultado).toBe("Erro");
});

test("somar 5 + 'abc' deveria retornar Erro", () => {
  const resultado = calculadora.somar(5, "abc");
  expect(resultado).toBe("Erro");
});
