/**
 * peasy-audio-js — Audio processing library for Node.js.
 *
 * 10 functions: info, convert, trim, merge, normalize, changeVolume,
 * fade, speed, reverseAudio, silence. FFmpeg-powered, TypeScript-first.
 *
 * @packageDocumentation
 */

export type {
  AudioFormat,
  AudioInfo,
  ConvertOptions,
  FadeOptions,
  SilenceOptions,
  SpeedOptions,
  TrimOptions,
  VolumeOptions,
} from "./types.js";

export {
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
} from "./engine.js";

// API Client
export { PeasyAudio } from "./client.js";
export type {
  ListOptions,
  ListGuidesOptions,
  ListConversionsOptions,
  PaginatedResponse,
  Tool,
  Category,
  Format,
  Conversion,
  GlossaryTerm,
  Guide,
  UseCase,
  Site,
  SearchResult,
} from "./api-types.js";
