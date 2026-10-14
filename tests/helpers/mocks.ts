export function respuestaJson(datos: unknown, status = 200): Response {
  return new Response(JSON.stringify(datos), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export interface FetchFalso {
  urls: string[];
  restaurar: () => void;
}

const fetchOriginal = globalThis.fetch;
const promptOriginal = globalThis.prompt;

export function instalarFetch(
  implementacion: (url: string) => Response | Promise<Response>,
): FetchFalso {
  const urls: string[] = [];
  globalThis.fetch = (async (
    entrada: Parameters<typeof fetch>[0],
  ): Promise<Response> => {
    const url =
      typeof entrada === "string"
        ? entrada
        : entrada instanceof URL
          ? entrada.toString()
          : entrada.url;
    urls.push(url);
    return implementacion(url);
  }) as typeof fetch;
  return {
    urls,
    restaurar: () => {
      globalThis.fetch = fetchOriginal;
    },
  };
}

export interface PromptFalso {
  mensajes: string[];
  restaurar: () => void;
}

export function instalarPrompt(respuestas: (string | null)[]): PromptFalso {
  const cola = [...respuestas];
  const mensajes: string[] = [];
  globalThis.prompt = (mensaje?: string): string | null => {
    mensajes.push(mensaje ?? "");
    return cola.length > 0 ? (cola.shift() ?? null) : null;
  };
  return {
    mensajes,
    restaurar: () => {
      globalThis.prompt = promptOriginal;
    },
  };
}

export interface ConsolaEspiada {
  lineas: string[];
  restaurar: () => void;
}

export function espiarConsola(): ConsolaEspiada {
  const original = console.log;
  const lineas: string[] = [];
  console.log = (...args: unknown[]): void => {
    lineas.push(args.map((a) => String(a)).join(" "));
  };
  return {
    lineas,
    restaurar: () => {
      console.log = original;
    },
  };
}
