/**
 * peasy-audio-js — Audio processing engine.
 *
 * All operations use fluent-ffmpeg to invoke FFmpeg for audio processing.
 * Functions take file paths and return Promises that resolve to output paths.
 *
 * @packageDocumentation
 */

import ffmpeg from "fluent-ffmpeg";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import type {
  AudioInfo,
  ConvertOptions,
  FadeOptions,
  SilenceOptions,
  SpeedOptions,
  TrimOptions,
  VolumeOptions,
} from "./types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a temporary output file path with the given extension.
 *
 * @param ext - File extension without dot (e.g. "mp3", "wav")
 * @returns Absolute path in the system temp directory
 */
export function tmpOutput(ext: string): string {
  return join(tmpdir(), `peasy-audio-${randomUUID()}.${ext}`);
}

/**
 * Run an ffmpeg command and resolve with the output path.
 *
 * Wraps fluent-ffmpeg's event-based API into a Promise.
 */
function run(command: ffmpeg.FfmpegCommand, output: string): Promise<string> {
  return new Promise((resolve, reject) => {
    command
      .output(output)
      .on("end", () => resolve(output))
      .on("error", (err: Error) => reject(err))
      .run();
  });
}

/**
 * Extract the file extension without the dot (e.g. "mp3" from "song.mp3").
 */
function getExt(filePath: string): string {
  return extname(filePath).slice(1) || "wav";
}

// ---------------------------------------------------------------------------
// Audio info (ffprobe)
// ---------------------------------------------------------------------------

/**
 * Get metadata for an audio file using ffprobe.
 *
 * @param input - Path to the audio file
 * @returns Audio metadata including duration, format, sample rate, channels
 *
 * @example
 * ```typescript
 * const metadata = await info("song.mp3");
 * console.log(metadata.duration);   // 180.5
 * console.log(metadata.sampleRate); // 44100
 * ```
 */
export function info(input: string): Promise<AudioInfo> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(input, (err, metadata) => {
      if (err) return reject(err);
      const audio = metadata.streams.find((s) => s.codec_type === "audio");
      resolve({
        duration: metadata.format.duration ?? 0,
        format: metadata.format.format_name ?? "unknown",
        sampleRate: audio?.sample_rate ? Number(audio.sample_rate) : 0,
        channels: audio?.channels ?? 0,
        bitrate: metadata.format.bit_rate ? Number(metadata.format.bit_rate) : 0,
        size: metadata.format.size ?? 0,
      });
    });
  });
}

// ---------------------------------------------------------------------------
// Convert
// ---------------------------------------------------------------------------

/**
 * Convert an audio file to a different format.
 *
 * @param input - Path to the source audio file
 * @param options - Conversion options (format, bitrate, sampleRate, channels)
 * @returns Path to the converted output file
 *
 * @example
 * ```typescript
 * // Convert MP3 to WAV
 * const wav = await convert("song.mp3", { format: "wav" });
 *
 * // Convert with specific bitrate and sample rate
 * const mp3 = await convert("song.wav", {
 *   format: "mp3",
 *   bitrate: "320k",
 *   sampleRate: 48000,
 * });
 * ```
 */
export function convert(
  input: string,
  options: ConvertOptions,
): Promise<string> {
  const output = tmpOutput(options.format);
  const cmd = ffmpeg(input);

  if (options.bitrate) {
    cmd.audioBitrate(options.bitrate);
  }
  if (options.sampleRate) {
    cmd.audioFrequency(options.sampleRate);
  }
  if (options.channels) {
    cmd.audioChannels(options.channels);
  }

  return run(cmd, output);
}

// ---------------------------------------------------------------------------
// Trim
// ---------------------------------------------------------------------------

/**
 * Trim an audio file to a specific time range.
 *
 * @param input - Path to the source audio file
 * @param options - Trim options (start, end, duration)
 * @returns Path to the trimmed output file
 *
 * @example
 * ```typescript
 * // Trim from 10s to 30s
 * const trimmed = await trim("song.mp3", { start: 10, end: 30 });
 *
 * // Trim first 5 seconds
 * const intro = await trim("song.mp3", { start: 0, duration: 5 });
 * ```
 */
export function trim(input: string, options: TrimOptions): Promise<string> {
  const ext = getExt(input);
  const output = tmpOutput(ext);
  const cmd = ffmpeg(input);

  if (options.start !== undefined) {
    cmd.setStartTime(options.start);
  }
  if (options.duration !== undefined) {
    cmd.setDuration(options.duration);
  } else if (options.end !== undefined && options.start !== undefined) {
    cmd.setDuration(options.end - options.start);
  } else if (options.end !== undefined) {
    cmd.setDuration(options.end);
  }

  return run(cmd, output);
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

/**
 * Merge multiple audio files into a single file.
 *
 * Files are concatenated in the order provided. All files should have
 * compatible formats (same sample rate and channels for best results).
 *
 * @param inputs - Array of paths to audio files to merge
 * @returns Path to the merged output file
 *
 * @example
 * ```typescript
 * const merged = await merge(["intro.mp3", "main.mp3", "outro.mp3"]);
 * ```
 */
export function merge(inputs: string[]): Promise<string> {
  if (inputs.length === 0) {
    return Promise.reject(new Error("At least one input file is required"));
  }

  const ext = getExt(inputs[0]!);
  const output = tmpOutput(ext);

  return new Promise((resolve, reject) => {
    const cmd = ffmpeg();

    for (const input of inputs) {
      cmd.input(input);
    }

    cmd
      .on("end", () => resolve(output))
      .on("error", (err: Error) => reject(err))
      .mergeToFile(output, tmpdir());
  });
}

// ---------------------------------------------------------------------------
// Normalize
// ---------------------------------------------------------------------------

/**
 * Normalize audio loudness using the EBU R128 loudnorm filter.
 *
 * @param input - Path to the source audio file
 * @returns Path to the normalized output file
 *
 * @example
 * ```typescript
 * const normalized = await normalize("quiet-recording.mp3");
 * ```
 */
export function normalize(input: string): Promise<string> {
  const ext = getExt(input);
  const output = tmpOutput(ext);
  const cmd = ffmpeg(input).audioFilters("loudnorm");

  return run(cmd, output);
}

// ---------------------------------------------------------------------------
// Change volume
// ---------------------------------------------------------------------------

/**
 * Adjust the volume of an audio file.
 *
 * @param input - Path to the source audio file
 * @param options - Volume options with change in dB
 * @returns Path to the volume-adjusted output file
 *
 * @example
 * ```typescript
 * // Increase volume by 3 dB
 * const louder = await changeVolume("song.mp3", { change: 3 });
 *
 * // Decrease volume by 5 dB
 * const quieter = await changeVolume("song.mp3", { change: -5 });
 * ```
 */
export function changeVolume(
  input: string,
  options: VolumeOptions,
): Promise<string> {
  const ext = getExt(input);
  const output = tmpOutput(ext);
  const cmd = ffmpeg(input).audioFilters(`volume=${options.change}dB`);

  return run(cmd, output);
}

// ---------------------------------------------------------------------------
// Fade
// ---------------------------------------------------------------------------

/**
 * Apply fade-in and/or fade-out effects to an audio file.
 *
 * @param input - Path to the source audio file
 * @param options - Fade options with fadeIn and/or fadeOut durations in seconds
 * @returns Path to the output file with fade effects
 *
 * @example
 * ```typescript
 * // Fade in over 2 seconds and fade out over 3 seconds
 * const faded = await fade("song.mp3", { fadeIn: 2, fadeOut: 3 });
 * ```
 */
export async function fade(
  input: string,
  options: FadeOptions,
): Promise<string> {
  const ext = getExt(input);
  const output = tmpOutput(ext);
  const filters: string[] = [];

  if (options.fadeIn !== undefined && options.fadeIn > 0) {
    filters.push(`afade=t=in:st=0:d=${options.fadeIn}`);
  }

  if (options.fadeOut !== undefined && options.fadeOut > 0) {
    // Need duration to calculate fade-out start — get it via ffprobe
    const metadata = await info(input);
    const fadeStart = metadata.duration - options.fadeOut;
    filters.push(`afade=t=out:st=${fadeStart}:d=${options.fadeOut}`);
  }

  const cmd = ffmpeg(input);
  if (filters.length > 0) {
    cmd.audioFilters(filters);
  }

  return run(cmd, output);
}

// ---------------------------------------------------------------------------
// Speed
// ---------------------------------------------------------------------------

/**
 * Change the playback speed of an audio file.
 *
 * Uses the atempo filter which supports factors between 0.5 and 100.0.
 * For factors outside the 0.5-2.0 range, multiple atempo filters are chained.
 *
 * @param input - Path to the source audio file
 * @param options - Speed options with factor (e.g. 0.5 = half, 2.0 = double)
 * @returns Path to the speed-adjusted output file
 *
 * @example
 * ```typescript
 * // Double speed
 * const fast = await speed("podcast.mp3", { factor: 2.0 });
 *
 * // Half speed
 * const slow = await speed("podcast.mp3", { factor: 0.5 });
 * ```
 */
export function speed(input: string, options: SpeedOptions): Promise<string> {
  const ext = getExt(input);
  const output = tmpOutput(ext);

  // atempo filter only supports 0.5 to 100.0 per instance.
  // For factors outside 0.5-2.0, chain multiple atempo filters.
  const filters: string[] = [];
  let remaining = options.factor;

  while (remaining > 2.0) {
    filters.push("atempo=2.0");
    remaining /= 2.0;
  }
  while (remaining < 0.5) {
    filters.push("atempo=0.5");
    remaining /= 0.5;
  }
  filters.push(`atempo=${remaining}`);

  const cmd = ffmpeg(input).audioFilters(filters);

  return run(cmd, output);
}

// ---------------------------------------------------------------------------
// Reverse
// ---------------------------------------------------------------------------

/**
 * Reverse an audio file.
 *
 * @param input - Path to the source audio file
 * @returns Path to the reversed output file
 *
 * @example
 * ```typescript
 * const reversed = await reverseAudio("message.mp3");
 * ```
 */
export function reverseAudio(input: string): Promise<string> {
  const ext = getExt(input);
  const output = tmpOutput(ext);
  const cmd = ffmpeg(input).audioFilters("areverse");

  return run(cmd, output);
}

// ---------------------------------------------------------------------------
// Silence
// ---------------------------------------------------------------------------

/**
 * Generate a silent audio file.
 *
 * @param options - Silence options including duration, format, and sample rate
 * @returns Path to the generated silence file
 *
 * @example
 * ```typescript
 * // Generate 5 seconds of silence as WAV
 * const gap = await silence({ duration: 5 });
 *
 * // Generate 2 seconds of silence as MP3 at 48kHz
 * const gap48 = await silence({ duration: 2, format: "mp3", sampleRate: 48000 });
 * ```
 */
export function silence(options: SilenceOptions): Promise<string> {
  const format = options.format ?? "wav";
  const sampleRate = options.sampleRate ?? 44100;
  const output = tmpOutput(format);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input("anullsrc")
      .inputFormat("lavfi")
      .inputOptions([`-channel_layout=stereo`, `-sample_rate=${sampleRate}`])
      .duration(options.duration)
      .output(output)
      .on("end", () => resolve(output))
      .on("error", (err: Error) => reject(err))
      .run();
  });
}
