import React, { useState, useEffect } from 'react';
import {
  chatOptions as importedChatOptions,
  initializeBotResponses,
  botResponseMap,
  handleGreeting,
  handleDefaultResponse
} from './botResponses.js'; // Adjust path as needed
import './index.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [inputMode, setInputMode] = useState('options');
  const [optionsMapping, setOptionsMapping] = useState(importedChatOptions);
  const [optionsFunctionMapping, setOptionsFunctionMapping] = useState(botResponseMap);

  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [userAvailability, setUserAvailability] = useState('');
  const [userInquiry, setUserInquiry] = useState('');
  const [infoToSet, setInfoToSet] = useState('');
  const [nextQuestions, setNextQuestions] = useState([]);


  const setSpecificInfo = (info) => {
    switch (infoToSet) {
      case 'email':
        const emailMatch = info.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
        if (emailMatch && emailMatch[0]) {
          return setUserEmail(info);
        } else {
          setMessages([...messages, { text: "That was an invalid email. Could you please provide a valid email address?", sender: 'bot' }]);
          throw new Error("Invalid email format");
        }
      case 'phone':
        return setUserPhone(info);
      case 'name':
        return setUserName(info);
      case 'availability':
        return setUserAvailability(info);
      case 'inquiry':
        return setUserInquiry(info);
      default:
        return null;
    }
  }

  const sendInfo = () => {
    console.log({
      email: userEmail,
      phone: userPhone,
      name: userName,
      availability: userAvailability,
      inquiry: userInquiry
    });
  }

  useEffect(() => {
    initializeBotResponses(setMessages, setInputMode, setUserEmail, setUserPhone, setUserName, setUserInquiry, setInfoToSet, setUserAvailability, setOptionsMapping, setOptionsFunctionMapping, setNextQuestions, sendInfo);
  }, [setMessages, setInputMode, setUserEmail, setUserPhone, setUserName, setUserInquiry, setInfoToSet, setUserAvailability, setOptionsMapping, setOptionsFunctionMapping, setNextQuestions, sendInfo]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setInputMode('options');
      setMessages([]);
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

  const simulateBotResponse = (userMessage, isOption = false) => {
    setTimeout(() => {
      const handler = optionsFunctionMapping[userMessage];
      if (handler) {
        handler();
      }
      try {
        setSpecificInfo(userMessage);
        if (nextQuestions.length !== 0) {
          nextQuestions[0]();
          setNextQuestions(nextQuestions.slice(1));
        }
      } catch (error) {
        console.error("Error setting specific info:", error);
      }
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
          ) : inputMode === 'options' ? (
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
          ):<></>}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;