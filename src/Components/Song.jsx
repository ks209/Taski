import React, { useState, useRef } from 'react';
import YouTube from 'react-youtube';
import { motion } from 'framer-motion';

const Song = () => {
  const [songs, setSongs] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const motionRef = useRef(null);

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const addSong = () => {
    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      setSongs([...songs, videoId]);
      setVideoUrl(''); 
    } else {
      alert('Invalid YouTube URL!');
    }
  };

  const handleVideoEnd = (index) => {
    const updatedSongs = [...songs];
    updatedSongs.splice(index, 1);
    setSongs(updatedSongs);
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
      <div className="container">
        <div className="flex justify-center items-center mb-1">
          <input
            type="text"
            className="border-2 border-gray-300 bg-transparent p-2 w-full md:w-1/2 rounded-lg focus:outline-none focus:border-blue-400"
            placeholder="Enter YouTube video URL..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white ml-1 rounded-lg hover:bg-blue-600"
            onClick={addSong}
          >
            Add Song
          </button>
        </div>

        <div className="w-[100%] h-[fit-content] overflow-hidden flex flex-col items-center justify-center">
          {songs.length > 0 ? songs.map((song, index) => (
            <div key={index} className="video-container mb-4">
              <YouTube
                videoId={song}
                className="w-full rounded-lg"
                opts={{
                  height: '200',
                  width: '256',
                  playerVars: {
                    autoplay: index === 0 ? 1 : 0,
                  },
                }}
                onEnd={() => handleVideoEnd(index)}
              />
            </div>
          )) : (
            <p className="text-center text-gray-500">No songs , for easy music use YTmusic button</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Song;
