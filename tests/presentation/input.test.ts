import { afterEach, describe, expect, test } from "bun:test";
import { leerOpcion, leerTexto } from "../../src/presentation/input";
import { instalarPrompt, type PromptFalso } from "../helpers/mocks";

let promptFalso: PromptFalso | undefined;

afterEach(() => {
  promptFalso?.restaurar();
  promptFalso = undefined;
});

describe("leerOpcion", () => {
  test("acepta las opciones 1 a 9", async () => {
    for (const opcion of ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const) {
      promptFalso = instalarPrompt([opcion]);
      expect(await leerOpcion()).toBe(opcion);
      promptFalso.restaurar();
    }
  });

  test("recorta espacios alrededor de la opción", async () => {
    promptFalso = instalarPrompt(["  5 "]);
    expect(await leerOpcion()).toBe("5");
  });

  test("marca como invalida cualquier otra entrada", async () => {
    for (const entrada of ["0", "10", "abc", ""]) {
      promptFalso = instalarPrompt([entrada]);
      expect(await leerOpcion()).toBe("invalida");
      promptFalso.restaurar();
    }
  });

  test("devuelve null en EOF (prompt devuelve null)", async () => {
    promptFalso = instalarPrompt([null]);
    expect(await leerOpcion()).toBeNull();
    promptFalso = instalarPrompt([]);
    expect(await leerOpcion()).toBeNull();
  });

  test("pide la opción con el texto esperado", async () => {
    promptFalso = instalarPrompt(["9"]);
    await leerOpcion();
    expect(promptFalso.mensajes[0]).toContain("Selecciona una opción");
  });
});

describe("leerTexto", () => {
  test("recorta el texto introducido", async () => {
    promptFalso = instalarPrompt(["  Madrid  "]);
    expect(await leerTexto("  Nombre: ")).toBe("Madrid");
  });

  test("conserva la entrada vacía", async () => {
    promptFalso = instalarPrompt([""]);
    expect(await leerTexto("  Nombre: ")).toBe("");
  });

  test("devuelve null en EOF", async () => {
    promptFalso = instalarPrompt([null]);
    expect(await leerTexto("  Nombre: ")).toBeNull();
  });

  test("usa el mensaje pasado como prompt", async () => {
    promptFalso = instalarPrompt(["x"]);
    await leerTexto("  Nombre de la ciudad (vacío para cancelar): ");
    expect(promptFalso.mensajes).toEqual(["  Nombre de la ciudad (vacío para cancelar): "]);
  });
});
