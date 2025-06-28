import React, { useState } from 'react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  // New state to control the input mode: 'text' or 'options'
  const [inputMode, setInputMode] = useState('text'); // Default to text input

  // Example options for the chat bot
  const chatOptions = [
    { label: "Check Order Status", value: "check_order_status" },
    { label: "Product Information", value: "product_info" },
    { label: "Contact Support", value: "contact_support" },
    { label: "General Inquiry", value: "general_inquiry" },
  ];

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // Optionally reset input mode when closing/opening
    if (!isOpen) {
      setInputMode('text'); // Reset to text when opening
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setMessages([...messages, { text: inputValue, sender: 'user' }]);
      setInputValue('');
      // Simulate bot reply and potentially change input mode
      simulateBotResponse(inputValue);
    }
  };

  const handleOptionClick = (optionLabel, optionValue) => {
    setMessages([...messages, { text: optionLabel, sender: 'user' }]);
    // Simulate bot reply based on the chosen option
    simulateBotResponse(optionValue, true); // Pass true to indicate it's an option click
  };

  // Function to simulate bot responses and manage input mode
  const simulateBotResponse = (userMessage, isOption = false) => {
    let botReply = "Thanks for your message! We'll get back to you shortly.";
    let nextInputMode = 'text'; // Default next mode

    if (isOption) {
      switch (userMessage) {
        case "check_order_status":
          botReply = "Please provide your order number to check its status.";
          nextInputMode = 'text'; // After choosing this option, switch to text for order number
          break;
        case "product_info":
          botReply = "What product are you interested in?";
          nextInputMode = 'text'; // Switch to text to get product details
          break;
        case "contact_support":
          botReply = "Please describe your issue, and we'll connect you with a representative. Would you like to leave a message or speak with someone now?";
          nextInputMode = 'options'; // Offer new options for contact
          // Example of dynamic options after this choice:
          // You might set a different set of options here, for simplicity, we're sticking to the main ones
          break;
        case "general_inquiry":
          botReply = "How can I help you with a general inquiry?";
          nextInputMode = 'text';
          break;
        default:
          break;
      }
    } else {
      // Logic for text-based replies if needed, e.g., if user types "hello"
      if (userMessage.toLowerCase().includes('hello')) {
        botReply = "Hi there! How can I assist you today?";
        nextInputMode = 'options'; // After a greeting, maybe offer options
      }
    }

    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: botReply, sender: 'bot' }
      ]);
      setInputMode(nextInputMode); // Set the next input mode
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
              {chatOptions.map((option) => (
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