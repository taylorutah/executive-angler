import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { keepResponseOk } from "./keep-response";

describe("keepResponseOk", () => {
  it("accepts 2xx", () => {
    assert.equal(keepResponseOk(201), true);
    assert.equal(keepResponseOk(200), true);
  });

  it("accepts unique-constraint duplicates so re-keep is not an error", () => {
    assert.equal(
      keepResponseOk(400, 'duplicate key value violates unique constraint "user_favorites_user_id_entity_type_entity_id_key"'),
      true,
    );
    assert.equal(
      keepResponseOk(400, 'duplicate key value violates unique constraint "user_favorite_sections_user_id_river_id_usgs_site_id_key"'),
      true,
    );
  });

  it("rejects other 4xx/5xx", () => {
    assert.equal(keepResponseOk(401, "Unauthorized"), false);
    assert.equal(keepResponseOk(500, "Failed to add favorite"), false);
    assert.equal(keepResponseOk(400), false);
  });
});
