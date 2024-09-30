// import React from 'react';
// import { FaRegFileAlt } from "react-icons/fa";
// import { LuDownload } from "react-icons/lu";
// import { IoClose } from "react-icons/io5";
// import { motion } from 'framer-motion';

// const Card = ({ data, reference, onToggleCompleted, onRemove }) => {
//     const curr = new Date();

//     const handleResize = (event, info) => {
//         setSize({
//           width: size.width + info.delta.x, // Adjust width as the user drags horizontally
//           height: size.height + info.delta.y, // Adjust height as the user drags vertically
//         });
//       };

//   return (  
//     <div className='pr-10' onDrag={handleResize}>

//     <motion.div
//       drag
//       dragConstraints={reference}
//       whileDrag={{ scale: 1.2 }}
//       dragTransition={{ bounceStiffness: 100, bounceDamping: 10 }}
//       className='relative w-60 h-72 bg-sky-200 rounded-[40px] bg-zinc-900/90 text-white py-10 px-8 overflow-hidden flex-shrink-0'
//       >

//         <div className='flex justify-between'>
//       <FaRegFileAlt />
//           <button onClick={onRemove}>
//             <IoClose />
//           </button>
//         </div>
//         <div className='flex flex-col justify-between h-[70%] '>
//       <p className='text-sm leading-tight mt-5 font-semibold'>{data.text}</p>

//       <p>{data.date}<span>
//         </span>
//         </p>
//         </div>
      
//           <button onClick={onToggleCompleted}>
//       <div className={`footer ${data.completed ? "bg-green-800" : "bg-red-800"} absolute bottom-0 left-0 w-full  semibold`}>
//         <div className='flex items-center justify-between px-8 py-3 mb-3'>
//             {data.completed ? "Done" : "Not Done"}
//         </div>
//       </div>
//           </button>
//     </motion.div>
//         </div>
//   );
// };

// export default Card;

import React, { useState, useRef, useEffect } from 'react';
import { FaRegFileAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { GoArrowDownRight } from "react-icons/go";
import { motion } from 'framer-motion';

const Card = ({ data, reference, onToggleCompleted, onRemove }) => {
  const [size, setSize] = useState({ width: 180, height: 220 }); 
  const [isResizing, setIsResizing] = useState(false); 
  const resizeRef = useRef(null); 
  
  
  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      setSize((prevSize) => ({
        width: Math.max(180, prevSize.width + e.movementX), // Min width constraint
        height: Math.max(220, prevSize.height + e.movementY), // Min height constraint
      }));
    }
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  return (
    <div className='pr-10'>
      <motion.div
        drag={!isResizing}
        dragConstraints={reference}
        whileDrag={{ scale: 1.05  }}
        dragTransition={{ bounceStiffness: 10, bounceDamping: 10 }}
        className='relative bg-sky-200 rounded-[20px] bg-zinc-900/90 text-white py-6 px-4 overflow-hidden flex-shrink-0'
        style={{ width: size.width, height: size.height }}
      >
        <div className='flex justify-between'>
          <FaRegFileAlt />
          <button onClick={onRemove}>
            <IoClose />
          </button>
        </div>

        <div className='flex flex-col justify-between h-[70%]'>
          <p className='text-sm leading-tight mt-5 font-semibold'>{data.text}</p>
          <p>{data.date}</p>
        </div>

        <button onClick={onToggleCompleted}>
          <div className={`footer ${data.completed ? "bg-green-800" : "bg-red-800"} absolute bottom-0 left-0 w-full  semibold`}>
            <div className='flex items-center justify-between px-6 py-2 mb-1'>
              {data.completed ? "Done" : "Not Done"}
            </div>
          </div>
        </button>

        <div
          ref={resizeRef}
          className="absolute bottom-0 right-0 w-[fit-content] h-[fit-content] p-[4px]  cursor-se-resize"
          onMouseDown={startResizing}
        ><GoArrowDownRight /></div>
      </motion.div>
    </div>
  );
};

export default Card;
