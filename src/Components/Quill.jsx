import React, { useEffect, useRef, useState } from 'react';

import { GoArrowDownRight } from 'react-icons/go';
import {motion} from 'framer-motion'
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';

const Quill = () => {
    
const [description, setDescription] = useState('');
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



  return (
    <div className="flex flex-col items-center max-w-[30vw] min-h-[fit-content] bg-zinc-800" style={{ width: size.height*1.6, height: size.height }}>
        <motion.div 
        ref={motionRef}
        drag={!isResizing}
      whileDrag={{ scale: 1 }}
      dragTransition={{ bounceStiffness: 100, bounceDamping: 10 }}
      className=' bg-sky-200  p-4 back bg-zinc-900/90 text-white flex-shrink-0'
    >
        
      <ReactQuill className='max-w-[30vw] min-h-[fit-content]' theme="snow" value={description} onChange={setDescription} />

      </motion.div>
    </div>
  );
};

export default Quill;

