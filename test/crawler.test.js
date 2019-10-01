import request from "supertest";
import app from "../server";

describe("Crawler", () => {
  it("Default Request", async done => {
    const body = {
      checkin: "02/10/2019",
      checkout: "05/10/2019"
    };

    request(app)
      .post("/api/buscar")
      .send(body)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
  }, 20000);

  it("Checkin > checkout", async done => {
    const body = {
      checkin: "09/10/2019",
      checkout: "05/10/2019"
    };

    request(app)
      .post("/api/buscar")
      .send(body)
      .set("Accept", "application/json")
      .expect(422, done);
  });

  it("Checkin < today", async done => {
    const body = {
      checkin: "09/08/2019",
      checkout: "05/10/2019"
    };

    request(app)
      .post("/api/buscar")
      .send(body)
      .set("Accept", "application/json")
      .expect(422, done);
  });
});
