const request = require("supertest");
const app = require("../server");

describe("Basic API Tests", () => {
  test("GET / should return Hello, World!", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Hello, World!" });
  });

  test("GET /sum should return sum of two numbers", async () => {
    const res = await request(app).get("/sum?a=5&b=7");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ result: 12 });
  });

  test("GET /sum should return error if missing params", async () => {
    const res = await request(app).get("/sum");
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Missing query parameters" });
  });
});
