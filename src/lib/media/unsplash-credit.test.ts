import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseUnsplashOembed,
  unsplashOembedUrl,
  unsplashPhotoPath,
} from "./unsplash-credit";

describe("unsplashPhotoPath", () => {
  it("reads the photo- id from a CDN URL", () => {
    assert.equal(
      unsplashPhotoPath(
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80",
      ),
      "photo-1469474968028-56623f02e42e",
    );
  });

  it("rejects non-Unsplash hosts", () => {
    assert.equal(unsplashPhotoPath("https://upload.wikimedia.org/wikipedia/commons/x.jpg"), null);
  });
});

describe("unsplashOembedUrl", () => {
  it("points oEmbed at the photo page, not the CDN file", () => {
    const url = unsplashOembedUrl(
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3",
    );
    assert.ok(url);
    assert.match(url, /unsplash\.com\/oembed\?url=/);
    assert.match(url, /photos%2Fphoto-1469474968028-56623f02e42e/);
  });
});

describe("parseUnsplashOembed", () => {
  it("prefers author_name over a generic Unsplash label", () => {
    assert.deepEqual(
      parseUnsplashOembed(
        { author_name: "Jane Doe", author_url: "https://unsplash.com/@jane" },
        "https://images.unsplash.com/photo-x",
      ),
      { name: "Jane Doe", url: "https://unsplash.com/@jane" },
    );
  });

  it("falls back when the payload is empty", () => {
    assert.deepEqual(parseUnsplashOembed({}, "https://images.unsplash.com/photo-x"), {
      name: "Unsplash",
      url: "https://images.unsplash.com/photo-x",
    });
  });
});
