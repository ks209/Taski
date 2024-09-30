
import React, {useState } from 'react'

import { motion } from 'framer-motion';



const Spotify = () => {

    const [show,setShow]=useState(false);
    const [link,setLink]=useState("https://open.spotify.com/playlist/6Ij6cqc4XYlHpggiXqt5SI");
    const [e,setE]=useState(true)
    const handleSubmit=()=>{
        console.log(link)
        setShow(true)
    }

    window.addEventListener("mousedown",()=>{
        setTimeout(()=>{setE(false)},8000)
        setTimeout(()=>{setE(true)},100)
    })

    
    const extractSpotifyPlaylistId = (embedUrl) => {
        // Example embed URL: "https://open.spotify.com/embed/playlist/your_playlist_id"
        const regex = /\/playlist\/([a-zA-Z0-9]+)/;
        const match = embedUrl.match(regex);
        console.log(match)
        return match ? match[1] : null; // Return the playlist ID if found, otherwise null
    };
    const id = extractSpotifyPlaylistId(link)

//https://open.spotify.com/embed/playlist/6Ij6cqc4XYlHpggiXqt5SI
  return (
  <motion.div 
        drag={e}
      whileDrag={{ scale: 1.1 }}
      dragTransition={{ bounceStiffness: 100, bounceDamping: 10 }}
      className=' bg-sky-200 h-[fit-content] w-[22vw] rounded  p-4 back bg-zinc-900/90  text-white '
    >

    {!show && <div className='w-[15vw] h-[10vh]'>
        <input defaultValue={"https://open.spotify.com/embed/playlist/6Ij6cqc4XYlHpggiXqt5SI"} className='bg-transparent border-white text-cyan-50' type="link" placeholder='Enter Spotify Playlist Link' onChange={(e)=>{setLink(e.target.value);}}/>
        <button
            className="bg-blue-500 w-[2fit-content] text-white ml-1 rounded-lg hover:bg-blue-600"
            onClick={handleSubmit}
            >add</button>
        </div>}
    {show && <div className="relative w-full h-[13vh] overflow-hidden">
        {console.log(id)}
      <iframe
        src={`https://open.spotify.com/embed/playlist/${id}`
    }        className=" w-full absolute h-[20vh] border-0"
        allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        ></iframe>
    </div>}
        </motion.div>
  )
}

export default Spotify