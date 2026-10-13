export async function pedirJson(url: string): Promise<unknown> {
  let respuesta: Response;
  try {
    respuesta = await fetch(url);
  } catch (e) {
    throw new Error(`sin conexión (${e instanceof Error ? e.message : String(e)})`);
  }
  if (!respuesta.ok) {
    throw new Error(`la API devolvió HTTP ${respuesta.status}`);
  }
  return respuesta.json();
}
