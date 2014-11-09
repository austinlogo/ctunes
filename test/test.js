var assert = require("assert");
var request = require("supertest");
var app = require("../app.js");

describe("CollabTunes", function() {

	describe("Routes", function() {
		it("'/' should return 200", function (done) {
			request(app).get("/").expect(200, done);
		});

		it("Nonexistent page should return 404", function (done) {
			request(app).get("/NotFound").expect(404, done);
		});
	});
});