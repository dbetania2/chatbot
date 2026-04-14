// archivo: tests/api.test.js

import request from "supertest";
import { jest } from "@jest/globals";

// 1. mockeamos el modulo usando la funcion nativa para es modules
jest.unstable_mockModule("../src/services/chatbot.js", () => ({
  askBot: jest.fn(async (message) => {
    if (message.length > 200) {
      return { success: false, error: "la pregunta excede el limite de 200 caracteres" };
    }
    return { success: true, data: "respuesta simulada del bot" };
  }),
}));

// 2. importamos el servidor de forma dinamica DESPUES de crear el mock
const { default: app } = await import("../src/api/server.js");

describe("api chatbot - endpoints", () => {
  it("deberia devolver status 200 y respuesta exitosa si el mensaje es valido", async () => {
    const response = await request(app)
      .post("/chat")
      .send({ message: "hablame de sql" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("deberia devolver status 400 si el mensaje esta vacio", async () => {
    const response = await request(app)
      .post("/chat")
      .send({ message: "" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

describe("api chatbot - limite de seguridad", () => {
  it("deberia devolver status 429 al exceder limite de consultas", async () => {
    // enviamos 5 peticiones (el limite actual)
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/chat")
        .send({ message: `spam ${i}` });
    }

    // la peticion 6 debe rebotar
    const responseBloqueada = await request(app)
      .post("/chat")
      .send({ message: "esta debe fallar" });

    expect(responseBloqueada.status).toBe(429);
  });
});