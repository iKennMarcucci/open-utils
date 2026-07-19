import { describe, it, expect } from "vitest";
import { parseOpenApi, fakeAll, fakeEndpoint, OPENAPI_EXAMPLE } from "@/lib/openapi-fake";

describe("parseOpenApi — errors", () => {
  it("errors on empty input", () => {
    const res = parseOpenApi("   ");
    expect(res.ok).toBe(false);
  });

  it("errors on text that is neither JSON nor YAML", () => {
    // A bare unquoted colon-less line is still YAML scalar; use clearly broken JSON-ish.
    const res = parseOpenApi("{ this is : not : valid : json");
    expect(res.ok).toBe(false);
  });

  it("errors when the 'paths' section is missing", () => {
    const res = parseOpenApi('{"openapi":"3.0.0","info":{"title":"X"}}');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/paths/);
  });
});

describe("parseOpenApi — OpenAPI 3 (JSON)", () => {
  it("extracts endpoints from the bundled example spec", () => {
    const res = parseOpenApi(OPENAPI_EXAMPLE);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data.title).toBe("API de tienda");
    expect(res.data.version).toBe("1.0.0");
    const ids = res.data.endpoints.map((e) => e.id).sort();
    expect(ids).toEqual(["get:/usuarios", "post:/usuarios"]);

    const post = res.data.endpoints.find((e) => e.method === "POST")!;
    expect(post.requestSchema).toBeDefined();
    expect(post.responseStatus).toBe("201");
  });

  it("fakes request & response bodies resolving $ref, respecting types", () => {
    const res = parseOpenApi(OPENAPI_EXAMPLE);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const out = JSON.parse(fakeAll(res.data.spec, res.data.endpoints));

    // GET /usuarios -> array of Usuario objects in the response.
    const get = out["GET /usuarios"];
    expect(get.status).toBe("200");
    expect(Array.isArray(get.response)).toBe(true);
    const user = get.response[0];
    expect(Object.keys(user).sort()).toEqual(
      ["activo", "ciudad", "creadoEn", "email", "id", "nombre"].sort()
    );
    expect(typeof user.id).toBe("string");
    expect(typeof user.activo).toBe("boolean");
    expect(user.email).toMatch(/@/); // email format honoured

    // POST /usuarios -> request body faked from NuevoUsuario, edad within [18, 90].
    const post = out["POST /usuarios"];
    expect(Object.keys(post.request).sort()).toEqual(
      ["edad", "email", "nombre"].sort()
    );
    expect(Number.isInteger(post.request.edad)).toBe(true);
    expect(post.request.edad).toBeGreaterThanOrEqual(18);
    expect(post.request.edad).toBeLessThanOrEqual(90);
  });
});

const SWAGGER_2_YAML = `
swagger: "2.0"
info:
  title: Items API
  version: "2.1"
paths:
  /items:
    get:
      summary: List items
      responses:
        200:
          schema:
            $ref: "#/definitions/Item"
    post:
      summary: Create item
      parameters:
        - in: body
          name: body
          schema:
            $ref: "#/definitions/NewItem"
      responses:
        201:
          schema:
            $ref: "#/definitions/Item"
definitions:
  Item:
    type: object
    properties:
      id:
        type: string
        format: uuid
      status:
        type: string
        enum: [active, inactive]
      label:
        type: string
        example: "Widget"
      count:
        type: integer
        minimum: 5
        maximum: 5
  NewItem:
    type: object
    properties:
      name:
        type: string
`;

describe("parseOpenApi — Swagger 2 (YAML)", () => {
  it("extracts endpoints, request (body param) and response ($ref) schemas", () => {
    const res = parseOpenApi(SWAGGER_2_YAML);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data.title).toBe("Items API");
    const post = res.data.endpoints.find((e) => e.method === "POST")!;
    expect(post.requestSchema).toBeDefined();
    expect(post.responseStatus).toBe("201");
  });

  it("fakes bodies respecting enum, example and numeric bounds", () => {
    const res = parseOpenApi(SWAGGER_2_YAML);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const out = JSON.parse(fakeAll(res.data.spec, res.data.endpoints));
    const item = out["GET /items"].response;
    expect(["active", "inactive"]).toContain(item.status); // enum respected
    expect(item.label).toBe("Widget"); // example respected
    expect(item.count).toBe(5); // min === max === 5
    expect(typeof item.id).toBe("string");
  });
});

describe("parseOpenApi — tolerant YAML regression", () => {
  it("parses a multi-line flow-mapping schema (the bug fixed by the 'yaml' parser)", () => {
    const spec = `
swagger: "2.0"
info:
  title: Flow
  version: "1"
paths:
  /x:
    get:
      responses:
        200:
          schema:
            type: array
            items: {
              type: string
            }
`;
    const res = parseOpenApi(spec);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const out = JSON.parse(fakeAll(res.data.spec, res.data.endpoints));
    const resp = out["GET /x"].response;
    expect(Array.isArray(resp)).toBe(true);
    expect(typeof resp[0]).toBe("string");
  });
});

describe("fakeEndpoint", () => {
  it("returns only the sides the endpoint actually has", () => {
    const res = parseOpenApi(OPENAPI_EXAMPLE);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const get = res.data.endpoints.find((e) => e.method === "GET")!;
    const faked = fakeEndpoint(res.data.spec, get);
    expect(faked.request).toBeUndefined(); // GET has no request body
    expect(faked.response).toBeDefined();
  });
});
