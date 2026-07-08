// Audio global — sem React context, tudo via window
const w = window as any;

if (!w.__audio) {
  const el = document.createElement("audio");
  el.preload = "auto";
  document.body.appendChild(el);
  w.__audio = {
    el,
    src: null as string | null,
    title: "",
    thumbnail: "",
    listeners: new Set<() => void>(),
    miniPlayerSide: "right" as "left" | "right",
    miniPlayerSideListeners: new Set<() => void>(),
    miniPlayerDocked: false,
    miniPlayerDockedListeners: new Set<() => void>(),
  };
}

function getA() { return w.__audio; }
function emit() { getA().listeners.forEach((fn: () => void) => fn()); }

export function audioPlay(src: string, title: string, thumbnail: string) {
  const a = getA();
  const isSpotify = /open\.spotify\.com/i.test(src);
  const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(src);

  if (!isSpotify && !isYouTube) {
    a.el.src = src;
    a.el.load();
    a.el.play().catch(() => {});
  }

  a.src = src;
  a.title = title;
  a.thumbnail = thumbnail;
  emit();
}

export function audioPause() {
  getA().el.pause();
  emit();
}

export function audioResume() {
  getA().el.play().catch(() => {});
  emit();
}

export function audioStop() {
  const a = getA();
  a.el.pause();
  a.el.currentTime = 0;
  a.el.removeAttribute("src");
  a.el.load();
  a.src = null;
  a.title = "";
  a.thumbnail = "";
  emit();
}

export function audioSeek(time: number) {
  getA().el.currentTime = time;
}

export function audioSubscribe(fn: () => void) {
  getA().listeners.add(fn);
  return () => getA().listeners.delete(fn);
}

export function audioGetEl() { return getA().el; }
export function audioGetSrc() { return getA().src; }

export function miniPlayerSideGet() { return getA().miniPlayerSide; }
export function miniPlayerSideSet(side: "left" | "right") {
  getA().miniPlayerSide = side;
  getA().miniPlayerSideListeners.forEach((fn: () => void) => fn());
}
export function miniPlayerSideSubscribe(fn: () => void) {
  getA().miniPlayerSideListeners.add(fn);
  return () => getA().miniPlayerSideListeners.delete(fn);
}

export function miniPlayerDockedGet() { return getA().miniPlayerDocked; }
export function miniPlayerDockedSet(docked: boolean) {
  getA().miniPlayerDocked = docked;
  getA().miniPlayerDockedListeners.forEach((fn: () => void) => fn());
}
export function miniPlayerDockedSubscribe(fn: () => void) {
  getA().miniPlayerDockedListeners.add(fn);
  return () => getA().miniPlayerDockedListeners.delete(fn);
}
