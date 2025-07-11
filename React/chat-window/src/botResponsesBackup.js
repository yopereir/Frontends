// botResponses.js

// This object will hold the state setters from ChatWidget
let chatWidgetSetters = {};

export const chatOptions = [
    { label: "IT consulting", value: "check_order_status" },
    { label: "Business Intelligence", value: "product_info" },
    { label: "Employee Sourcing", value: "contact_support" },
    { label: "Other", value: "general_inquiry" },
];

export const initializeBotResponses = (setMessages, setInputMode, setUserEmail, setUserName, setUserQuestion) => {
  chatWidgetSetters = { setMessages, setInputMode, setUserEmail, setUserName, setUserQuestion };
};

// Simulate a bot typing delay
const simulateTypingDelay = (callback) => {
  setTimeout(callback, 1000);
};

// Function to send a bot message
const sendBotMessage = (text) => {
  chatWidgetSetters.setMessages((prevMessages) => [
    ...prevMessages,
    { text: text, sender: 'bot' }
  ]);
};

// --- Bot Response Functions ---

export const handleCheckOrderStatus = () => {
  sendBotMessage("Please provide your order number to check its status.");
  chatWidgetSetters.setInputMode('text');
  // You might set a state for 'awaitingOrderNumber' if you need to validate the next input
};

export const handleProductInformation = () => {
  sendBotMessage("What product are you interested in?");
  chatWidgetSetters.setInputMode('text');
  // You might set a state for 'awaitingProductInfo'
};

export const handleContactSupport = () => {
  sendBotMessage("Please describe your issue, and we'll connect you with a representative. Would you like to leave a message or speak with someone now?");
  // For simplicity, we'll keep the input mode as 'text' after this.
  // In a real scenario, you might offer new options here (e.g., "Leave Message", "Speak Now")
  chatWidgetSetters.setInputMode('text');
};

export const handleGeneralInquiry = () => {
  sendBotMessage("How can I help you with a general inquiry?");
  chatWidgetSetters.setInputMode('text');
};

export const handleGreeting = () => {
  sendBotMessage("Hi there! How can I assist you today?");
  chatWidgetSetters.setInputMode('options'); // After a greeting, maybe offer options
};

export const handleDefaultResponse = () => {
  sendBotMessage("Thanks for your message! We'll get back to you shortly.");
  chatWidgetSetters.setInputMode('text');
};

// You can add more specific response functions as needed
export const handleOrderNumberInput = (orderNumber) => {
  sendBotMessage(`Looking up order number: ${orderNumber}. One moment please...`);
  // Here you would typically make an API call to fetch order status
  simulateTypingDelay(() => {
    sendBotMessage("Your order #12345 is currently processing and expected to ship within 2 business days.");
    chatWidgetSetters.setInputMode('options'); // Go back to options after providing info
  });
};

export const handleCollectUserEmail = () => {
    sendBotMessage("Could you please provide your email address?");
    chatWidgetSetters.setInputMode('text');
    // You might set a state flag like `awaitingEmail` to process the next input specifically as an email.
}

export const handleCollectUserName = () => {
    sendBotMessage("What's your name, please?");
    chatWidgetSetters.setInputMode('text');
    // You might set a state flag like `awaitingUserName`
}

export const handleCollectUserQuestion = () => {
    sendBotMessage("Please type your question or concern.");
    chatWidgetSetters.setInputMode('text');
    // You might set a state flag like `awaitingUserQuestion`
}

// Map for quick access based on value
export const botResponseMap = {
  "check_order_status": handleCheckOrderStatus,
  "product_info": handleProductInformation,
  "contact_support": handleContactSupport,
  "general_inquiry": handleGeneralInquiry,
};