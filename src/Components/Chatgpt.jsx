import React, { useState } from "react";
import Groq from "groq-sdk";
import {motion} from 'framer-motion' 

function Chatgpt({motionRef}) {
  const [message, setMessage] = useState("hi");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    try {
        var chatCompletion = await new Groq({apiKey : "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",dangerouslyAllowBrowser: true}).chat.completions.create({
            "messages": [
              {
                "role": "user",
                "content": message
              }
            ],
            "model": "llama3-8b-8192"
          });

            setResponse(chatCompletion.choices[0]?.message?.content || "");
    } catch (error) {
      console.error("Error:", error);
      setResponse("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
    ref={motionRef}
    drag={true}
  whileDrag={{ scale: 1 }}
  dragTransition={{ bounceStiffness: 100, bounceDamping: 10 }} className="w-[20vw] h-[40vh] overflow-auto bg-zinc-900 opacity-90 rounded text-slate-300" style={{ padding: "10px" }}>
      <div>
        <label>
          Enter your message:
          <input
            className="bg-[transparent] border"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ marginLeft: "10px", width: "90%" }}
            placeholder="Ask something..."
          />
        </label>
      </div>
      <div className="flex gap-4">

      <div className="bg-blue-950 w-[fit-content] p-1 rounded mt-4">
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </button>
      </div>
      <div className="bg-blue-950 w-[fit-content] p-1 rounded mt-4">

        <button onClick={()=>{setMessage('')}} disabled={loading}>
          Reset
        </button>
      </div>
      </div>
      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </motion.div>
  );
}

export default Chatgpt;
