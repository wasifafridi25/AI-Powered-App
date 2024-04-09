import { useState, useEffect, FormEvent, useRef } from "react";
import Head from "next/head";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TextField, Button } from "@mui/material";

// Load environment variables from .env file
require("dotenv").config();

type Message = {
  type: "user" | "bot";
  message: string;
};

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const apiKey: string = process.env.NEXT_PUBLIC_API_KEY as string;
  const genAI = new GoogleGenerativeAI(apiKey);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    setChatLog((prevChatLog) => [
      ...prevChatLog,
      { type: "user", message: inputValue },
    ]);

    try {
      setIsLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(inputValue);
      const response = await result.response;
      const text = response.text();
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { type: "bot", message: text },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }

    setInputValue("");
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatLog]);

  return (
    <div className="container mx-auto max-w-[1000px]">
      <Head>
        <title>AI Powered App</title>
        <meta
          name="description"
          content="Your chat application powered by Google Generative AI"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div ref={chatContainerRef} className="flex flex-col h-screen bg-gray-900 overflow-y-auto">
        <h1 className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text text-center py-3 font-bold text-6xl">AI Powered App</h1>
        <div className="flex-grow p-6">
          <div className="flex flex-col space-y-4">
            {chatLog.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${message.type === 'user' ? 'bg-purple-500 max-w-sm' : 'bg-gray-700 max-w-2xl'} rounded-lg p-4 text-white`}>
                  {message.message}
                </div>
              </div>
            ))}
            {isLoading && (
              <div key={chatLog.length} className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-4 text-white max-w-sm">
                  <div className="typing-animation"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex-none p-6">
          <div className="flex rounded-lg border border-gray-700 bg-gray-800">
            {/* <input type="text" className="flex-grow px-4 py-2 bg-transparent text-white focus:outline-none" placeholder="Type your message..." value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                handleSubmit(e);
              }
            }}/> */}
            {/* <button type="submit" className="bg-purple-500 rounded-lg px-4 py-2 text-white 
            font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300">Send</button> */}
            <TextField
                variant="standard"
                fullWidth
                placeholder="Type your message..."
                className="flex-grow px-4 py-2 bg-transparent text-white focus:outline-none"
                InputProps={{ style: { color: 'white' } }}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    handleSubmit(e);
                  }
                }}
              />
              <Button type="submit" className="bg-purple-500 rounded-lg px-4 py-2 text-white 
            font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300" variant="contained" color="primary">
                Send
              </Button>
          </div>
        </form>
      </div>

    </div>
  );
}
