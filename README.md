# peasy-audio

[![npm version](https://agentgif.com/badge/npm/peasy-audio/version.svg)](https://www.npmjs.com/package/peasy-audio)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Audio processing library for Node.js -- convert between 6 formats (MP3, WAV, OGG, FLAC, AAC, M4A), trim segments, merge files, normalize volume, apply fade effects, adjust speed, and generate silence. FFmpeg-powered, TypeScript-first with full type safety.

Built from [PeasyAudio](https://peasyaudio.com), a free online audio toolkit with 10 browser-based tools for converting, trimming, merging, normalizing, and analyzing audio files.

> **Try the interactive tools at [peasyaudio.com](https://peasyaudio.com)** -- audio conversion, trimming, merging, normalization, and analysis

<p align="center">
  <img src="demo.gif" alt="peasy-audio demo — audio info, format conversion, and volume operations in Node.js" width="800">
</p>

## Table of Contents

- [Prerequisites](#prerequisites)
- [Install](#install)
- [Quick Start](#quick-start)
- [What You Can Do](#what-you-can-do)
  - [Audio Info & Metadata](#audio-info--metadata)
  - [Format Conversion](#format-conversion)
  - [Trimming & Merging](#trimming--merging)
  - [Volume & Normalization](#volume--normalization)
  - [Audio Effects](#audio-effects)
- [TypeScript Types](#typescript-types)
- [API Reference](#api-reference)
- [Also Available for Python](#also-available-for-python)
- [Peasy Developer Tools](#peasy-developer-tools)
- [License](#license)

## Prerequisites

peasy-audio uses FFmpeg under the hood. Install it before using this library:

| Platform | Command |
|----------|---------|
| **macOS** | `brew install ffmpeg` |
| **Ubuntu/Debian** | `sudo apt install ffmpeg` |
| **Fedora/RHEL** | `sudo dnf install ffmpeg-free` |
| **Windows** | `choco install ffmpeg` |

## Install

```bash
npm install peasy-audio
```

## Quick Start

```typescript
import { info, convert, trim, merge, normalize } from "peasy-audio";

// Get audio file metadata
const metadata = await info("song.mp3");
console.log(metadata.duration, metadata.sampleRate); // 240.5 44100

// Convert MP3 to WAV
const wavPath = await convert("song.mp3", { format: "wav" });

// Trim to 30-second clip
const clip = await trim("song.mp3", { start: 10, duration: 30 });

// Merge multiple audio files
const combined = await merge(["intro.mp3", "main.mp3", "outro.mp3"]);

// Normalize volume to consistent levels
const normalized = await normalize("quiet-recording.mp3");
```

## What You Can Do

### Audio Info & Metadata

Every audio file has metadata -- duration, sample rate, channels, bitrate, and codec information. The `info()` function uses FFprobe to extract this data without decoding the entire file, making it fast even for large files.

```typescript
import { info } from "peasy-audio";

// Extract audio metadata using FFprobe
const meta = await info("podcast.mp3");
console.log(meta.duration);   // 3600.5 (seconds)
console.log(meta.sampleRate); // 44100 (Hz)
console.log(meta.channels);   // 2 (stereo)
console.log(meta.bitrate);    // 320000 (bits/sec)
console.log(meta.format);     // "mp3"
```

Learn more: [Peasy Audio Tools](https://peasyaudio.com) · [Glossary](https://peasytools.com/glossary/)

### Format Conversion

Audio format conversion transforms audio data between container formats and codecs. Common conversions include MP3 to WAV (for editing), WAV to FLAC (lossless archiving), and any format to AAC/M4A (Apple ecosystem compatibility).

| Format | Extension | Use Case |
|--------|-----------|----------|
| MP3 | `.mp3` | Universal playback, streaming |
| WAV | `.wav` | Editing, uncompressed quality |
| OGG | `.ogg` | Open-source, web audio |
| FLAC | `.flac` | Lossless archiving |
| AAC | `.aac` | Apple ecosystem, efficient |
| M4A | `.m4a` | iTunes, Apple Music |

```typescript
import { convert } from "peasy-audio";

// Convert MP3 to WAV for editing
const wav = await convert("music.mp3", { format: "wav" });

// Convert to FLAC with custom sample rate
const flac = await convert("music.mp3", {
  format: "flac",
  sampleRate: 48000,
});

// Downmix stereo to mono
const mono = await convert("stereo.wav", {
  format: "mp3",
  channels: 1,
  bitrate: "128k",
});
```

Learn more: [Peasy Audio Tools](https://peasyaudio.com) · [Glossary](https://peasytools.com/glossary/)

### Trimming & Merging

Audio trimming extracts a segment by specifying start time and duration or end time. Merging concatenates multiple audio files sequentially into a single output file.

```typescript
import { trim, merge } from "peasy-audio";

// Extract a 30-second segment starting at 1 minute
const clip = await trim("podcast.mp3", { start: 60, duration: 30 });

// Trim from start to end time
const intro = await trim("song.mp3", { start: 0, end: 15 });

// Merge multiple files into one
const combined = await merge([
  "chapter1.mp3",
  "chapter2.mp3",
  "chapter3.mp3",
]);
```

Learn more: [Peasy Audio Tools](https://peasyaudio.com) · [Glossary](https://peasytools.com/glossary/)

### Volume & Normalization

Audio normalization adjusts the overall volume level to a target loudness, measured in dBFS (decibels relative to full scale). The EBU R128 standard defines target loudness at -23 LUFS for broadcast, while streaming platforms typically target -14 LUFS.

```typescript
import { normalize, changeVolume } from "peasy-audio";

// Normalize volume using FFmpeg loudnorm filter
const normalized = await normalize("quiet-recording.mp3");

// Increase volume by 6dB (roughly doubles perceived loudness)
const louder = await changeVolume("track.mp3", { change: 6 });

// Decrease volume by 3dB
const softer = await changeVolume("loud-track.mp3", { change: -3 });
```

Learn more: [Peasy Audio Tools](https://peasyaudio.com) · [Glossary](https://peasytools.com/glossary/)

### Audio Effects

Apply fade effects, speed changes, reversal, and generate silence programmatically. These operations use FFmpeg audio filters for sample-accurate processing.

```typescript
import { fade, speed, reverseAudio, silence } from "peasy-audio";

// Apply 3-second fade in and 5-second fade out
const faded = await fade("song.mp3", { fadeIn: 3, fadeOut: 5 });

// Double the playback speed (pitch shifts)
const fast = await speed("podcast.mp3", { factor: 2.0 });

// Slow down to 75% speed
const slow = await speed("audiobook.mp3", { factor: 0.75 });

// Reverse audio
const reversed = await reverseAudio("sample.mp3");

// Generate 5 seconds of silence as WAV
const gap = await silence({ duration: 5, format: "wav", sampleRate: 44100 });
```

Learn more: [Peasy Audio Tools](https://peasyaudio.com) · [Glossary](https://peasytools.com/glossary/)

## TypeScript Types

```typescript
import type {
  AudioFormat,
  AudioInfo,
  ConvertOptions,
  TrimOptions,
  FadeOptions,
  SpeedOptions,
  VolumeOptions,
  SilenceOptions,
} from "peasy-audio";

// AudioFormat — "mp3" | "wav" | "ogg" | "flac" | "aac" | "m4a"
const format: AudioFormat = "mp3";

// AudioInfo — metadata from info()
const meta: AudioInfo = {
  duration: 240.5,
  format: "mp3",
  sampleRate: 44100,
  channels: 2,
  bitrate: 320000,
  size: 9_600_000,
};
```

## API Reference

| Function | Description |
|----------|-------------|
| `info(input)` | Get audio metadata (duration, format, sample rate, channels, bitrate) |
| `convert(input, options)` | Convert between audio formats (MP3, WAV, OGG, FLAC, AAC, M4A) |
| `trim(input, options)` | Extract a segment by start/end/duration |
| `merge(inputs)` | Concatenate multiple audio files sequentially |
| `normalize(input)` | Normalize volume using EBU R128 loudnorm filter |
| `changeVolume(input, options)` | Adjust volume by dB amount |
| `fade(input, options)` | Apply fade in/out effects |
| `speed(input, options)` | Change playback speed (0.5x to 4.0x) |
| `reverseAudio(input)` | Reverse audio playback |
| `silence(options)` | Generate silence of specified duration |

## Also Available for Python

```bash
pip install peasy-audio
```

The Python package provides the same 12 audio operations with CLI and pydub engine. See [peasy-audio on PyPI](https://pypi.org/project/peasy-audio/).

## Peasy Developer Tools

| Package | PyPI | npm | Description |
|---------|------|-----|-------------|
| peasy-pdf | [PyPI](https://pypi.org/project/peasy-pdf/) | [npm](https://www.npmjs.com/package/peasy-pdf) | PDF merge, split, compress, rotate, watermark |
| peasy-image | [PyPI](https://pypi.org/project/peasy-image/) | [npm](https://www.npmjs.com/package/peasy-image) | Image resize, crop, compress, convert, watermark |
| peasytext | [PyPI](https://pypi.org/project/peasytext/) | [npm](https://www.npmjs.com/package/peasytext) | Text analysis, case conversion, slugs, word count |
| peasy-css | [PyPI](https://pypi.org/project/peasy-css/) | [npm](https://www.npmjs.com/package/peasy-css) | CSS gradients, shadows, flexbox, grid generators |
| peasy-compress | [PyPI](https://pypi.org/project/peasy-compress/) | [npm](https://www.npmjs.com/package/peasy-compress) | ZIP, gzip, brotli, deflate compression |
| peasy-document | [PyPI](https://pypi.org/project/peasy-document/) | [npm](https://www.npmjs.com/package/peasy-document) | Markdown, HTML, CSV, JSON, YAML conversion |
| **peasy-audio** | [PyPI](https://pypi.org/project/peasy-audio/) | **[npm](https://www.npmjs.com/package/peasy-audio)** | **Audio convert, trim, merge, normalize, effects** |
| peasy-video | [PyPI](https://pypi.org/project/peasy-video/) | [npm](https://www.npmjs.com/package/peasy-video) | Video trim, resize, thumbnails, GIF conversion |

Part of the [Peasy](https://peasytools.com) developer tools ecosystem.

## License

MIT
