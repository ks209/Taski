import React, { useState, useRef } from "react";

import { motion } from "framer-motion";

const tracks = [
  { id: "jfKfPfyJRdk", name: "Lofi Girl", sub: "beats to study/relax to" },
  { id: "4xDzrJKXOOY", name: "Synthwave Mix", sub: "retrowave & chillsynth" },
  { id: "5qap5aO4i9A", name: "Chillhop Radio", sub: "jazzy beats & lofi hip hop" },
  { id: "n61ULEU7CO0", name: "Dark Ambient", sub: "deep focus for coding" },
  { id: "DWcJFNfaw9c", name: "Coding Music", sub: "concentration & flow" },
  { id: "lTRiuFIWV54", name: "Coffee Shop", sub: "lo-fi background noise" },
  { id: "MVPTGNGiI-4", name: "Chillwave Mix", sub: "relaxing electronic" },
  { id: "7NOSDKb0HlU", name: "Deep Focus", sub: "study music for work" },
  { id: "qH3fETPsqYc", name: "Midnight Jazz", sub: "late night coding vibes" },
];

// Multiple search strategies — tries each until one works
const searchStrategies = [
  // Strategy 1: Invidious via corsproxy.io
  async (query) => {
    const target = `https://invidious.io/api/v1/search?q=${encodeURIComponent(query)}&type=video&sort_by=relevance`;
    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(target)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const v = data[0];
    if (!v) throw new Error("No results");
    return { id: v.videoId, name: v.title, sub: v.author };
  },

  // Strategy 2: Different Invidious instance via allorigins
  async (query) => {
    const target = `https://vid.puffyan.us/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const v = data[0];
    if (!v) throw new Error("No results");
    return { id: v.videoId, name: v.title, sub: v.author };
  },

  // Strategy 3: Invidious public instance direct (some allow CORS)
  async (query) => {
    const res = await fetch(
      `https://invidious.snopyta.org/api/v1/search?q=${encodeURIComponent(query)}&type=video`,
      { mode: "cors" }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const v = data[0];
    if (!v) throw new Error("No results");
    return { id: v.videoId, name: v.title, sub: v.author };
  },

  // Strategy 4: ytapi.me (public no-key YouTube wrapper)
  async (query) => {
    const res = await fetch(
      `https://ytapi.me/api/?search=${encodeURIComponent(query)}&result=1`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const v = data?.items?.[0];
    if (!v) throw new Error("No results");
    return {
      id: v.id?.videoId || v.videoId,
      name: v.snippet?.title || v.title,
      sub: v.snippet?.channelTitle || v.channelTitle || "YouTube",
    };
  },
];

const searchYouTube = async (query) => {
  for (const strategy of searchStrategies) {
    try {
      const result = await strategy(query);
      if (result?.id) return result;
    } catch (_) {
      continue;
    }
  }
  throw new Error("All search methods failed");
};

const EqBars = ({ mini = false }) => (
  <div className={`flex items-end gap-[2px] ${mini ? "h-3" : "h-[18px]"}`}>
    {[...Array(mini ? 3 : 5)].map((_, i) => (
      <div
        key={i}
        className={`${mini ? "w-[2px]" : "w-[3px]"} bg-amber-400 rounded-sm animate-pulse`}
        style={{
          height: ["40%", "100%", "60%", "80%", "50%"][i],
          animationDelay: `${[0, 0.2, 0.1, 0.15, 0.25][i]}s`,
          animationDuration: `${[0.8, 0.7, 0.9, 0.75, 0.85][i]}s`,
        }}
      />
    ))}
  </div>
);

const DevMusic = ({motionRef}) => {
  const [playlist, setPlaylist] = useState(tracks);
  const [current, setCurrent] = useState(tracks[0]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const track = await searchYouTube(query);
      const exists = playlist.find((t) => t.id === track.id);
      if (!exists) setPlaylist((prev) => [track, ...prev]);
      setCurrent(track);
      setQuery("");
      setSearchOpen(false);
    } catch (e) {
      setError("Couldn't find it. Try a more specific name.");
    } finally {
      setLoading(false);
    }
  };

  const openSearch = () => {
    setSearchOpen(true);
    setError("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <motion.div
      ref={motionRef}
      drag={true}
      whileDrag={{ scale: 1 }}
      dragTransition={{ bounceStiffness: 100, bounceDamping: 10 }}
      style={{ width: 256, height: "fit-content" }}
      className='bg-sky-200 overflow-hidden p-4 bg-zinc-900/90 text-white flex-shrink-0'
    >
    <div
      className="absolute top-4 right-4 w-[340px] bg-[#0d0d0d] text-white rounded-xl overflow-hidden border border-zinc-800 shadow-2xl z-50 flex flex-col"
      style={{ maxHeight: "90vh" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono text-[10px] tracking-[3px] text-amber-400 uppercase">
            Dev.FM
          </span>
        </div>
        <button
          onClick={searchOpen ? () => setSearchOpen(false) : openSearch}
          className="font-mono text-[10px] tracking-widest text-zinc-400 hover:text-amber-400 transition-colors uppercase border border-zinc-700 hover:border-amber-400/50 rounded px-2 py-1"
        >
          {searchOpen ? "✕ cancel" : "+ play"}
        </button>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-amber-400 text-sm flex-shrink-0">/play</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Khoj, Tum Hi Ho, Shape of You..."
              className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="font-mono text-[10px] bg-amber-400 text-black px-2 py-1 rounded disabled:opacity-40 transition-opacity"
            >
              {loading ? "···" : "GO"}
            </button>
          </div>
          {error && <p className="text-[11px] text-red-400 font-mono pl-10">{error}</p>}
        </div>
      )}

      {/* YouTube Embed */}
      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
        <iframe
          key={current.id}
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${current.id}?autoplay=1&rel=0&modestbranding=1`}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          title={current.name}
        />
      </div>

      {/* Now Playing */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="overflow-hidden">
          <p className="font-mono text-[9px] text-amber-400 tracking-[2px] uppercase mb-1">
            Now Playing
          </p>
          <p className="text-sm font-medium text-zinc-100 truncate">
            {current.name} — {current.sub}
          </p>
        </div>
        <EqBars />
      </div>

      {/* Playlist */}
      <div className="overflow-y-auto flex-1 px-3 py-2">
        <p className="font-mono text-[9px] text-zinc-500 tracking-[2px] uppercase px-2 py-2">
          Playlist — {playlist.length} Tracks
        </p>
        {playlist.map((track, i) => {
          const isActive = track.id === current.id;
          return (
            <div
              key={track.id}
              onClick={() => setCurrent(track)}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? "bg-amber-950/30 border border-amber-400/20"
                  : "hover:bg-zinc-800 border border-transparent"
              }`}
            >
              <div className="w-6 flex justify-center flex-shrink-0">
                {isActive ? (
                  <EqBars mini />
                ) : (
                  <span className="font-mono text-[10px] text-zinc-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
              </div>
              <img
                src={track.thumb || `https://img.youtube.com/vi/${track.id}/mqdefault.jpg`}
                alt={track.name}
                className="w-14 h-9 rounded object-cover flex-shrink-0 bg-zinc-800"
              />
              <div className="overflow-hidden flex-1">
                <p className={`text-[13px] truncate font-medium ${isActive ? "text-amber-400" : "text-zinc-200"}`}>
                  {track.name}
                </p>
                <p className="text-[11px] text-zinc-500 truncate">{track.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </motion.div>
  );
};

export default DevMusic;