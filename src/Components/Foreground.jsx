import React, { useRef, useState } from 'react';
import Card from './Card'; 
import { CiSquarePlus, CiText } from "react-icons/ci";
import { SiYoutubemusic } from "react-icons/si";
import { IoIosAdd } from "react-icons/io";
import Player from './Player';
import Quill from './Quill';
import { FaSpotify } from "react-icons/fa";
import Chatgpt from './Chatgpt';
import { BsStars } from "react-icons/bs";
import { FaYoutube } from "react-icons/fa6";
import Spotify from './Spotify';
import Song from './Song';

const Foreground = () => {
  const ref = useRef(null); 
  const key = "my_to_dos"; 
  const [show, setShow]=useState(false);
  const [showAi, setShowAi]=useState(false);
  const [showPlaylist, setShowPlaylist]=useState(false);
  const [showQuill, setShowQuill]=useState(false);
  const [showYT, setShowYT]=useState(false);
  const [showSpotify, setShowSpotify]=useState(false);
  const [todos, setTodos] = useState(() => {
    const storedTodos = localStorage.getItem(key);
    return storedTodos ? JSON.parse(storedTodos) : [];
  });

  const [task, setTask] = useState('');
  const [date, setDate] = useState('');

  const saveTodos = (data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addTodo = () => {
    if (task && date) { 
      const newTodos = [...todos, { text: task, date: date || null, completed: false }];
      setTodos(newTodos);
      saveTodos(newTodos);
      setTask(''); 
      setDate('');
    }
  };

  const toggleCompleted = (index) => {
    const newTodos = [...todos];
    newTodos[index].completed = !newTodos[index].completed;
    setTodos(newTodos);
    saveTodos(newTodos);
  };

  const removeTodo = (index) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
    saveTodos(newTodos); 
  };

  return (
    <div ref={ref}  className={` top-0 left-0 z-[3] w-full h-full flex justify-normal align-top gap-5 p-5 relative`}>
      
      <div className='flex flex-col w-[10vw] align-center gap-[20px]'>
      <IoIosAdd className='text-4xl text-white border-green-50 before:add'  onClick={()=>{setShow(!show)}}/>
        <CiText className='text-4xl text-white border-green-50 before:add'  onClick={()=>{setShowQuill(!showQuill)}}/>
        <SiYoutubemusic className='text-4xl text-white border-green-50 before:add'  onClick={()=>{setShowPlaylist(!showPlaylist)}} />
        <BsStars className='text-4xl text-white border-green-50 before:add'  onClick={()=>{setShowAi(!showAi)}} />
        <FaYoutube  className='text-4xl text-white border-green-50 before:add'  onClick={()=>{setShowYT(!showYT)}} />
        <FaSpotify  className='text-4xl text-white border-green-50 before:add'  onClick={()=>{setShowSpotify(!showSpotify)}} />
      </div>
      <div className={` transition-all 1s  border h-[fit-content] p-2 flex-col ${show ? "flex" : "hidden"}`}>
        <input 
          type="text"
          placeholder="Enter task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className='mb-2 p-2 bg-[transparent] rounded text-white'
        />
        <input
          type="date"
          defaultValue={Date()}
          optional={true}
          onChange={(e) => setDate(e.target.value)}
          className='mb-2 p-2 bg-[transparent] text-white rounded'
        />
        <button onClick={()=>{addTodo(); setShow(!show)}} className='p-2 text-center pl-[30%] bg-zinc-500 text-white rounded flex items-center gap-2'>
           Add Task
        </button>
      </div>

      
      <div className='w-[100%] flex-wrap align-top justify-evenly h-[screen] flex gap-[4px]'>

      {showPlaylist && <Player ref={ref}/>}

      {showQuill && <Quill/>}
      {showYT && <Song/>}

      {showAi  && 
      <Chatgpt motionRef={ref}/>}

      {showSpotify && <Spotify/>}
      
      {todos.map((todo, index) => (
        <Card
        key={index} 
        data={todo} 
        completed={todo.completed} 
        onToggleCompleted={() => toggleCompleted(index)} 
        onRemove={() => removeTodo(index)}
        reference={ref}
        />
      ))}
      </div>
    </div>
  );
};

export default Foreground;
