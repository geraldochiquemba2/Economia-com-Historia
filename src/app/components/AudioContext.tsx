import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

type AudioState = {
  isPlaying: boolean;
  src: string | null;
  title: string;
  thumbnail: string;
  currentTime: number;
  duration: number;
};

type AudioContextType = {
  audio: AudioState;
  play: (src: string, title: string, thumbnail: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
};

const AudioCtx = createContext<AudioContextType | null>(null);

// Global audio element — lives on window, never destroyed
function getEl(): HTMLAudioElement {
  const w = window as any;
  if (!w.__audioEl) {
    w.__audioEl = document.createElement("audio");
    w.__audioEl.preload = "auto";
    document.body.appendChild(w.__audioEl);
  }
  return w.__audioEl;
}

// Global state — lives on window, survives any React re-render
function getStore(): AudioState {
  const w = window as any;
  if (!w.__audioState) {
    w.__audioState = {
      isPlaying: false,
      src: null,
      title: "",
      thumbnail: "",
      currentTime: 0,
      duration: 0,
    } as AudioState;
  }
  return w.__audioState;
}

// Listeners for state changes
type Listener = () => void;
function subscribe(fn: Listener) {
  const w = window as any;
  if (!w.__audioListeners) w.__audioListeners = new Set();
  w.__audioListeners.add(fn);
  return () => w.__audioListeners.delete(fn);
}
function emit() {
  const w = window as any;
  (w.__audioListeners || new Set()).forEach((fn: Listener) => fn());
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [, forceRender] = useState(0);
  const rerender = useCallback(() => forceRender((n) => n + 1), []);

  useEffect(() => {
    const el = getEl();
    const store = getStore();

    const onTime = () => {
      store.currentTime = el.currentTime;
      store.duration = el.duration || 0;
      emit();
    };
    const onPlay = () => { store.isPlaying = true; emit(); };
    const onPause = () => { store.isPlaying = false; emit(); };
    const onEnd = () => { store.isPlaying = false; emit(); };
    const onLoaded = () => { store.duration = el.duration || 0; emit(); };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnd);
    el.addEventListener("loadedmetadata", onLoaded);

    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);

  useEffect(() => {
    return subscribe(rerender);
  }, [rerender]);

  const play = useCallback((src: string, title: string, thumbnail: string) => {
    const el = getEl();
    const store = getStore();

    if (store.src === src) {
      el.play().catch(() => {});
      return;
    }

    el.src = src;
    el.load();
    el.play().catch(() => {});

    store.src = src;
    store.title = title;
    store.thumbnail = thumbnail;
    store.currentTime = 0;
    store.duration = 0;
    store.isPlaying = true;
    emit();
  }, []);

  const pause = useCallback(() => {
    getEl().pause();
  }, []);

  const resume = useCallback(() => {
    getEl().play().catch(() => {});
  }, []);

  const stop = useCallback(() => {
    const el = getEl();
    el.pause();
    el.currentTime = 0;
    el.removeAttribute("src");
    el.load();

    const store = getStore();
    store.isPlaying = false;
    store.src = null;
    store.title = "";
    store.thumbnail = "";
    store.currentTime = 0;
    store.duration = 0;
    emit();
  }, []);

  const seek = useCallback((time: number) => {
    getEl().currentTime = time;
  }, []);

  const audio = getStore();

  return (
    <AudioCtx.Provider value={{ audio, play, pause, resume, stop, seek }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
