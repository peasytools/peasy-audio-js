import { describe, it, expect } from "vitest";
import {
  info,
  convert,
  trim,
  merge,
  normalize,
  changeVolume,
  fade,
  speed,
  reverseAudio,
  silence,
} from "../src/index.js";
import { tmpOutput } from "../src/engine.js";

// ---------------------------------------------------------------------------
// Export verification
// ---------------------------------------------------------------------------

describe("exports", () => {
  it("exports all 10 audio functions", () => {
    expect(typeof info).toBe("function");
    expect(typeof convert).toBe("function");
    expect(typeof trim).toBe("function");
    expect(typeof merge).toBe("function");
    expect(typeof normalize).toBe("function");
    expect(typeof changeVolume).toBe("function");
    expect(typeof fade).toBe("function");
    expect(typeof speed).toBe("function");
    expect(typeof reverseAudio).toBe("function");
    expect(typeof silence).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// tmpOutput helper
// ---------------------------------------------------------------------------

describe("tmpOutput", () => {
  it("generates a path with the correct extension", () => {
    const path = tmpOutput("mp3");
    expect(path).toMatch(/\.mp3$/);
  });

  it("generates a path with wav extension", () => {
    const path = tmpOutput("wav");
    expect(path).toMatch(/\.wav$/);
  });

  it("generates unique paths on each call", () => {
    const paths = new Set<string>();
    for (let i = 0; i < 100; i++) {
      paths.add(tmpOutput("mp3"));
    }
    expect(paths.size).toBe(100);
  });

  it("includes peasy-audio prefix in the filename", () => {
    const path = tmpOutput("flac");
    expect(path).toContain("peasy-audio-");
  });

  it("generates paths in the system temp directory", async () => {
    const { tmpdir } = await import("node:os");
    const path = tmpOutput("ogg");
    expect(path.startsWith(tmpdir())).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Error handling (no FFmpeg required)
// ---------------------------------------------------------------------------

describe("info", () => {
  it("rejects on non-existent file", async () => {
    await expect(info("/nonexistent/audio/file.mp3")).rejects.toThrow();
  });
});

describe("convert", () => {
  it("rejects on non-existent input", async () => {
    await expect(
      convert("/nonexistent/file.mp3", { format: "wav" }),
    ).rejects.toThrow();
  });
});

describe("trim", () => {
  it("rejects on non-existent input", async () => {
    await expect(
      trim("/nonexistent/file.mp3", { start: 0, duration: 5 }),
    ).rejects.toThrow();
  });
});

describe("merge", () => {
  it("rejects with empty inputs array", async () => {
    await expect(merge([])).rejects.toThrow(
      "At least one input file is required",
    );
  });

  it("rejects on non-existent input files", async () => {
    await expect(merge(["/nonexistent/a.mp3"])).rejects.toThrow();
  });
});

describe("normalize", () => {
  it("rejects on non-existent input", async () => {
    await expect(normalize("/nonexistent/file.mp3")).rejects.toThrow();
  });
});

describe("changeVolume", () => {
  it("rejects on non-existent input", async () => {
    await expect(
      changeVolume("/nonexistent/file.mp3", { change: 3 }),
    ).rejects.toThrow();
  });
});

describe("speed", () => {
  it("rejects on non-existent input", async () => {
    await expect(
      speed("/nonexistent/file.mp3", { factor: 2.0 }),
    ).rejects.toThrow();
  });
});

describe("reverseAudio", () => {
  it("rejects on non-existent input", async () => {
    await expect(reverseAudio("/nonexistent/file.mp3")).rejects.toThrow();
  });
});
