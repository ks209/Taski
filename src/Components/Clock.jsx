// src/DigitalClock.js
import React, { useEffect, useState } from "react";

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  const day = (key) =>{
    switch (key) {
        case 1:
            return "MON";
        case 2:
            return "TUE";
        case 3:
            return "WED";
        case 4:
            return "THU";
        case 5:
            return "FRI";
        case 6:
            return "SAT";
        case 0:
            return "SUN";
    
        default:
            break;
    }
  }
  const month = (key) => {
    switch (key) {
      case 1:
        return "JAN";
      case 2:
        return "FEB";
      case 3:
        return "MAR";
      case 4:
        return "APR";
      case 5:
        return "MAY";
      case 6:
        return "JUN";
      case 7:
        return "JUL";
      case 8:
        return "AUG";
      case 9:
        return "SEP";
      case 10:
        return "OCT";
      case 11:
        return "NOV";
      case 12:
        return "DEC";
      default:
        return "Invalid month";
    }
  };
  


  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const dates = date.getDate();
    return `${hours}:${minutes}`;
  };

  return (
    <div className="flex justify-center items-end h-screen ">
      <div className="text-2xl font-bold text-zinc-900 p-10 rounded-lg border-none border transform  tracking-tighter transition-transform duration-300 hover:scale-105 text-center">
        {formatTime(time)}<br/>
        {month(time.getMonth()) + " " + time.getDate().toString()   +" " +day(time.getDay())}
      </div>
    </div>
  );
};

export default DigitalClock;
