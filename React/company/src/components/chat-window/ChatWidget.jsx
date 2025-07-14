import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import {
  chatOptions as importedChatOptions,
  initializeBotResponses,
  botResponseMap,
  handleGreeting,
  handleDefaultResponse
} from './botResponses'; // Adjust path as needed
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
  const [waitForInput, setWaitForInput] = useState(false);

  // Create a ref for the chat messages container
  const messagesEndRef = useRef(null);

  // INFO: Either set shouldSetTheme to false OR Comment out for production. This is for Manually setting theme
  useEffect(() => {
    let shouldManuallySetTheme = false;
    if (shouldManuallySetTheme) {
      let manualTheme = 'light-mode';
      const addClassRecursively = (element) => {
        if (element && element.classList) {element.classList.add(manualTheme)}
        if (element && element.children) {Array.from(element.children).forEach(child => {addClassRecursively(child)})}
      };
      const removeClassRecursively = (element) => {
        if (element && element.classList) {element.classList.remove(manualTheme)}
        if (element && element.children) {Array.from(element.children).forEach(child => {removeClassRecursively(child)})}
      };
      if (isOpen) {
        if (document.body) {addClassRecursively(document.body)}
      } else {
        if (document.body) {removeClassRecursively(document.body)}
      }
      return () => {if (document.body) {removeClassRecursively(document.body)}};
    }
  }, [isOpen]);

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

  const sendInfo = async () => {
    console.log({
      email: userEmail,
      phone: userPhone,
      name: userName,
      availability: userAvailability,
      inquiry: userInquiry
    });

    const body = new URLSearchParams();
    body.append('name', userName);
    body.append('email', userEmail);
    body.append('phone', userPhone);
    body.append('inquiry', userInquiry);
    body.append('availability', userAvailability);
    const GOOGLE_APPSCRIPT_CONTACT_URL = "https://script.google.com/macros/s/AKfycbyjTNX8KlQT7vmJZPhSNgvDQ2NlkIm8uux8Lud1dNijnKQ7x7066fdS0jLEtXKiZiQwOA/exec";
    try {
      await fetch(GOOGLE_APPSCRIPT_CONTACT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ form: 'There was an error submitting the form. Please try again.' });
    }
  }

  useEffect(() => {
    initializeBotResponses(setMessages, setInputMode, setUserEmail, setUserPhone, setUserName, setUserInquiry, setInfoToSet, setUserAvailability, setOptionsMapping, setOptionsFunctionMapping, setNextQuestions, sendInfo, setWaitForInput);
  }, [setMessages, setInputMode, setUserEmail, setUserPhone, setUserName, setUserInquiry, setInfoToSet, setUserAvailability, setOptionsMapping, setOptionsFunctionMapping, setNextQuestions, sendInfo, setWaitForInput]);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

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
        if (waitForInput) {
          setWaitForInput(false);
        } else {
          if (nextQuestions.length !== 0) {
            nextQuestions[0]();
            setNextQuestions(nextQuestions.slice(1));
          }
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
          <div className="chat-messages" ref={messagesEndRef}> {/* Apply the ref here */}
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