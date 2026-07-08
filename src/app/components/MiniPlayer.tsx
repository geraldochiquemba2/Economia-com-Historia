import React, { useState, useEffect } from "react";
import { X, Volume2, ChevronLeft, ChevronRight, Minus } from "lucide-react";
import { audioGetSrc, audioStop, audioGetEl, audioSubscribe, miniPlayerSideGet, miniPlayerSideSet, miniPlayerDockedGet, miniPlayerDockedSet, miniPlayerDockedSubscribe } from "./audioStore";

function getSpotifyEmbed(url: string): string | null {
  const match = url.match(/open\.spotify\.com\/(episode|track|playlist|album)\/([a-zA-Z0-9]+)/);
  if (match) return `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`;
  return null;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function MiniPlayer() {
  const [src, setSrc] = useState<string | null>(audioGetSrc());
  const [title, setTitle] = useState("");
  const [thumb, setThumb] = useState("");
  const [side, setSide] = useState<"left" | "right">(miniPlayerSideGet());
  const [docked, setDocked] = useState(miniPlayerDockedGet());
  const [isPlaying, setIsPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const sync = () => {
      setSrc(audioGetSrc());
      setTitle((window as any).__audio?.title || "");
      setThumb((window as any).__audio?.thumbnail || "");
    };
    sync();
    const unsub = audioSubscribe(sync);
    const unsubDock = miniPlayerDockedSubscribe(() => setDocked(miniPlayerDockedGet()));
    return () => { unsub(); unsubDock(); };
  }, []);

  useEffect(() => {
    const el = audioGetEl();
    if (!el) return;
    const sync = () => {
      setIsPlaying(!el.paused);
      setCur(el.currentTime);
      setDur(el.duration || 0);
    };
    el.addEventListener("play", sync);
    el.addEventListener("pause", sync);
    el.addEventListener("ended", sync);
    el.addEventListener("timeupdate", sync);
    el.addEventListener("loadedmetadata", sync);
    sync();
    return () => {
      el.removeEventListener("play", sync);
      el.removeEventListener("pause", sync);
      el.removeEventListener("ended", sync);
      el.removeEventListener("timeupdate", sync);
      el.removeEventListener("loadedmetadata", sync);
    };
  }, [src]);

  if (!src) return null;

  const isSpotify = /open\.spotify\.com/i.test(src);
  const spotifyEmbed = isSpotify ? getSpotifyEmbed(src) : null;
  const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(src);
  const youtubeId = isYouTube ? getYouTubeId(src) : null;

  const toggleDock = () => {
    const newDocked = !miniPlayerDockedGet();
    miniPlayerDockedSet(newDocked);
    if (newDocked) {
      miniPlayerSideSet("right");
    }
  };

  const togglePlay = () => {
    const el = audioGetEl();
    if (!el || isSpotify || isYouTube) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const seek = (time: number) => {
    const el = audioGetEl();
    if (el) el.currentTime = time;
  };

  const progress = dur > 0 ? (cur / dur) * 100 : 0;
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <>
      {/* ===== DOCKED STRIP ===== */}
      <div style={{ position: "fixed", bottom: 137, zIndex: 200, right: 0, display: docked ? "block" : "none" }}>
        <button
          onClick={toggleDock}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", padding: "12px 8px",
            borderRadius: "12px 0 0 12px", cursor: "pointer",
          }}
        >
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {side === "right" ? <ChevronLeft style={{ width: 16, height: 16, color: "white" }} /> : <ChevronRight style={{ width: 16, height: 16, color: "white" }} />}
          </div>
          {thumb ? (
            <img src={thumb} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#3A0310", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Volume2 style={{ width: 14, height: 14, color: "#E8B4B8" }} />
            </div>
          )}
          {!isSpotify && !isYouTube && (
            <div onClick={(e) => { e.stopPropagation(); togglePlay(); }} style={{ cursor: "pointer", width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isPlaying ? (
                <svg style={{ width: 16, height: 16 }} fill="white" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              ) : (
                <svg style={{ width: 16, height: 16, marginLeft: 2 }} fill="white" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
              )}
            </div>
          )}
          <div onClick={(e) => { e.stopPropagation(); audioStop(); }} style={{ cursor: "pointer", width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X style={{ width: 16, height: 16, color: "white" }} />
          </div>
        </button>
      </div>

      {/* ===== FULL PLAYER ===== */}
      <div style={{ position: "fixed", bottom: 170, left: 12, right: 12, zIndex: 200, display: docked ? "none" : "block" }}
           className="md:!bottom-[115px] md:!left-auto md:!right-6 md:!w-96">
        {isYouTube && youtubeId ? (
          <div style={{ background: "#1A1A1A", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px 0 12px" }}>
              {thumb ? <img src={thumb} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} /> : (
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#3A0310", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Volume2 style={{ width: 14, height: 14, color: "#E8B4B8" }} /></div>
              )}
              <p style={{ color: "white", fontSize: 10, fontWeight: 700, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{title}</p>
              <button onClick={toggleDock} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "none", cursor: "pointer" }}>
                <Minus style={{ width: 16, height: 16, color: "white" }} />
              </button>
              <button onClick={audioStop} style={{ width: 32, height: 32, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "none", cursor: "pointer" }}>
                <X style={{ width: 14, height: 14, color: "#1A1A1A" }} />
              </button>
            </div>
            <div style={{ padding: "8px 12px 12px 12px" }}>
              <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", borderRadius: 8, overflow: "hidden" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  frameBorder="0"
                  allow="autoplay"
                />
              </div>
            </div>
          </div>
        ) : isSpotify && spotifyEmbed ? (
          <div style={{ background: "#1A1A1A", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px 0 12px" }}>
              {thumb ? <img src={thumb} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} /> : (
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#3A0310", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Volume2 style={{ width: 14, height: 14, color: "#E8B4B8" }} /></div>
              )}
              <p style={{ color: "white", fontSize: 10, fontWeight: 700, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{title}</p>
              <button onClick={toggleDock} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "none", cursor: "pointer" }}>
                <Minus style={{ width: 16, height: 16, color: "white" }} />
              </button>
              <button onClick={audioStop} style={{ width: 32, height: 32, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "none", cursor: "pointer" }}>
                <X style={{ width: 14, height: 14, color: "#1A1A1A" }} />
              </button>
            </div>
            <iframe src={spotifyEmbed} width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
          </div>
        ) : (
          <div style={{ background: "#1A1A1A", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.1)", cursor: "pointer", position: "relative", borderRadius: "16px 16px 0 0" }}
                 onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * dur); }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", background: "#E8B4B8", borderRadius: "0 999px 999px 0", width: `${progress}%` }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
              {thumb ? <img src={thumb} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} /> : (
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#3A0310", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Volume2 style={{ width: 20, height: 20, color: "#E8B4B8" }} /></div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "white", fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{title}</p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 500, margin: 0 }}>{fmtTime(cur)} / {fmtTime(dur)}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <button onClick={togglePlay} style={{ width: 44, height: 44, borderRadius: "50%", background: "#3A0310", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
                  {isPlaying ? (
                    <svg style={{ width: 20, height: 20 }} fill="white" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                  ) : (
                    <svg style={{ width: 20, height: 20, marginLeft: 2 }} fill="white" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
                  )}
                </button>
                <button onClick={toggleDock} style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
                  <Minus style={{ width: 20, height: 20, color: "white" }} />
                </button>
                <button onClick={audioStop} style={{ width: 44, height: 44, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
                  <X style={{ width: 20, height: 20, color: "#1A1A1A" }} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
