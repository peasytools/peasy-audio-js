/**
 * peasy-audio-js — Audio processing types.
 *
 * @packageDocumentation
 */

/** Supported audio formats. */
export type AudioFormat = "mp3" | "wav" | "ogg" | "flac" | "aac" | "m4a";

/** Audio file metadata. */
export interface AudioInfo {
  /** Duration in seconds. */
  duration: number;
  /** Container format name (e.g. "mp3", "wav"). */
  format: string;
  /** Sample rate in Hz (e.g. 44100, 48000). */
  sampleRate: number;
  /** Number of audio channels (1 = mono, 2 = stereo). */
  channels: number;
  /** Bitrate in bits per second. */
  bitrate: number;
  /** File size in bytes. */
  size: number;
}

/** Options for audio conversion. */
export interface ConvertOptions {
  /** Target audio format. */
  format: AudioFormat;
  /** Target bitrate (e.g. "128k", "320k"). */
  bitrate?: string;
  /** Target sample rate in Hz (e.g. 44100, 48000). */
  sampleRate?: number;
  /** Number of output channels (1 = mono, 2 = stereo). */
  channels?: number;
}

/** Options for audio trimming. */
export interface TrimOptions {
  /** Start time in seconds. */
  start?: number;
  /** End time in seconds. */
  end?: number;
  /** Duration in seconds (alternative to end). */
  duration?: number;
}

/** Options for fade effects. */
export interface FadeOptions {
  /** Fade-in duration in seconds. */
  fadeIn?: number;
  /** Fade-out duration in seconds. */
  fadeOut?: number;
}

/** Options for speed adjustment. */
export interface SpeedOptions {
  /** Speed factor (e.g. 0.5 = half speed, 2.0 = double speed). */
  factor: number;
}

/** Options for volume adjustment. */
export interface VolumeOptions {
  /** Volume change in dB (e.g., 3 for +3dB, -5 for -5dB). */
  change: number;
}

/** Options for silence generation. */
export interface SilenceOptions {
  /** Duration of silence in seconds. */
  duration: number;
  /** Output format (default: "wav"). */
  format?: AudioFormat;
  /** Sample rate in Hz (default: 44100). */
  sampleRate?: number;
}
