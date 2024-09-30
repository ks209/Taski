import React, { useEffect, useRef, useState } from 'react';
import { GoArrowDownRight } from 'react-icons/go';
import {motion} from 'framer-motion'

const PlaylistPlayer = ({ref}) => {
  const [playlistId, setPlaylistId] = useState('https://youtube.com/playlist?list=PLdsAA9rPvNPxo8FbugA_pch42ai1JtcY0&si=B-QiaDbRrNwwGuX2'); 
  const [show, setShow] = useState(false); 
  const [iframeSrc, setIframeSrc] = useState(''); 
  const [size, setSize] = useState({ width: 256, height: 200 }); 
  const motionRef=useRef(null)

  const [isResizing, setIsResizing] = useState(false); 
  const resizeRef = useRef(null); 
  
  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      setSize((prevSize) => ({
        width: Math.max(200, prevSize.width + e.movementX/2), // Min width constraint
        height: Math.max(250, prevSize.height + e.movementY/2), // Min height constraint
      }));
    }
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
        motionRef.drag= false;
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopResizing);
    } else {
        motionRef.drag= true;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
        motionRef.drag= true;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  const getYouTubePlaylistId = (url) => {
    const regex = /[?&]list=([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = getYouTubePlaylistId(playlistId);
    if (id) {
      setIframeSrc(`https://www.youtube.com/embed/videoseries?list=${id}&autoplay=1&loop=1`);
      setShow(!show);
    } else {
      alert('Please enter a valid YouTube playlist link.');
    }
  };

  return (
    <div className="flex flex-col items-center  bg-zinc-800" style={{ width: size.height*1.6, height: size.height }}>
        <motion.div 
        ref={motionRef}
        drag={!isResizing}
      whileDrag={{ scale: 1 }}
      dragConstraints={ref}
      dragTransition={{ bounceStiffness: 100, bounceDamping: 10 }}
      className=' bg-sky-200  p-4 back bg-zinc-900/90 text-white flex-shrink-0'
    >

      {!show && <form onSubmit={handleSubmit} className="mb-5 w-[90%] max-w-md flex flex-col">
        <input
          type="text"
          placeholder="Enter YouTube playlist link"
          value={playlistId}
          onChange={(e) => setPlaylistId(e.target.value)}
          className="p-2 bg-[transparent] border border-gray-300 rounded mb-2"
          />
        <button type="submit" className="p-2 bg-slate-900 text-white rounded">
          Load Playlist
        </button>
      </form>}

      {iframeSrc && (
          <div className="w-full flex transition-all">
          <iframe
            width={size.height*1.6}
            height={size.height}
            src={iframeSrc}
            title="YouTube Playlist Player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
      
      <div ref={resizeRef} className='w-[fit-content] h-[fit-content]' onMouseDown={startResizing}>
      <GoArrowDownRight />
      </div>
      </div>
      )}
      </motion.div>
    </div>
  );
};

export default PlaylistPlayer;
