import React, { useState, useEffect } from 'react';
import {
  chatOptions as importedChatOptions,
  initializeBotResponses,
  botResponseMap,
  handleGreeting,
  handleDefaultResponse
} from './botResponses'; // Adjust path as needed

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [inputMode, setInputMode] = useState('options'); // Default to text input
  const [optionsMapping, setOptionsMapping] = useState(importedChatOptions);
  const [optionsFunctionMapping, setOptionsFunctionMapping] = useState(botResponseMap);

  // New state variables to track user information
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userAvailability, setUserAvailability] = useState('');
  const [userInquiry, setUserInquiry] = useState('');
  const [nextQuestions, setNextQuestions] = useState([]);

  // Initialize bot responses with setters when the component mounts or setters change
  useEffect(() => {
    initializeBotResponses(setMessages, setInputMode, setUserEmail, setUserName, setUserInquiry, setUserAvailability, setOptionsMapping, setOptionsFunctionMapping, setNextQuestions);
  }, [setMessages, setInputMode, setUserEmail, setUserName, setUserInquiry, setUserAvailability, setOptionsMapping, setOptionsFunctionMapping, setNextQuestions]);


  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setInputMode('options'); // Reset to text when opening
      setMessages([]); // Clear messages when opening a new chat session
      // Optionally reset other user states
      // setUserEmail('');
      // setUserName('');
      // setUserInquiry('');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const userMessage = inputValue.trim();
      setMessages([...messages, { text: userMessage, sender: 'user' }]);
      setInputValue('');
      simulateBotResponse(userMessage, false);
    }
  };

  const handleOptionClick = (optionLabel, optionValue) => {
    setMessages([...messages, { text: optionLabel, sender: 'user' }]);
    simulateBotResponse(optionValue, true);
  };

  // Function to simulate bot responses and manage input mode
  const simulateBotResponse = (userMessage, isOption = false) => {
    setTimeout(() => {
      if (isOption) {
        const handler = optionsFunctionMapping[userMessage];
        if (handler) {
          handler();
        } else if (userMessage === "get_email") { // Handle new option directly here for demonstration
          if (userEmail) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: `Your current email is: ${userEmail}`, sender: 'bot' }
            ]);
          } else {
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: "I don't have your email address yet.", sender: 'bot' }
            ]);
            // If we don't have it, prompt to collect it.
            initializeBotResponses(setMessages, setInputMode, setUserEmail, setUserName, setUserInquiry, setUserAvailability).handleCollectUserEmail();
          }
          setInputMode('text');
        } else {
          handleDefaultResponse();
        }
      } else {
        // Logic for text-based replies if needed
        if (userMessage.toLowerCase().includes('hello')) {
          handleGreeting();
        } else if (userMessage.toLowerCase().includes('email is')) {
          const emailMatch = userMessage.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
          if (emailMatch && emailMatch[0]) {
            setUserEmail(emailMatch[0]);
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: `Thanks, I've noted your email as ${emailMatch[0]}.`, sender: 'bot' }
            ]);
            setInputMode('options'); // Go back to options after email is collected
          } else {
            handleDefaultResponse();
          }
        } else {
          handleDefaultResponse();
        }
      }
      nextQuestions[0]()
      setNextQuestions(nextQuestions.slice(1));
    }, 1000);
  };

  return (
    <div className="chat-widget-container">
      {!isOpen ? (
        <button className="chat-toggle-button" onClick={toggleChat}>
          Chat
        </button>
      ) : (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Chat Support</h3>
            <button className="close-chat-button" onClick={toggleChat}>
              &times;
            </button>
          </div>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="no-messages">Type a message or select an option to start chatting!</p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))
            )}
          </div>
          {/* Conditional rendering for input section */}
          {inputMode === 'text' ? (
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
              />
              <button type="submit">Send</button>
            </form>
          ) : (
            <div className="chat-options">
              {optionsMapping.map((option) => (
                <button
                  key={option.value}
                  className="chat-option-button"
                  onClick={() => handleOptionClick(option.label, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;