// botResponses.js

// This object will hold the state setters from ChatWidget
let chatWidgetSetters = {};

export const initializeBotResponses = (setMessages, setInputMode, setUserEmail, setUserPhone, setUserName, setUserInquiry, setInfoToSet, setUserAvailability, setOptionsMapping, setOptionsFunctionMapping, setNextQuestions, sendInfo) => {
  chatWidgetSetters = { setMessages, setInputMode, setUserEmail, setUserPhone, setUserName, setUserInquiry, setInfoToSet, setUserAvailability, setOptionsMapping, setOptionsFunctionMapping, setNextQuestions, sendInfo };
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

export const handleRequestITConsulting = () => {
  sendBotMessage("We offer the entire gammat of IT services- from simple website building to fully managed Cloud Infrastructure. Please provide a brief description of what you want to achieve.");
  chatWidgetSetters.setNextQuestions([
    handleCollectUserContact,handleCollectUserAvailability, handleThankYouMessage]);
  chatWidgetSetters.setInputMode('text');
  chatWidgetSetters.setInfoToSet('inquiry');
  // You might set a state for 'awaitingOrderNumber' if you need to validate the next input
};

export const handleRequestBusinessIntelligence = () => {
  sendBotMessage("Business Intelligence helps leverages data to make your business more efficient. Briefly describe, where you would find this most useful?");
  chatWidgetSetters.setNextQuestions([
    handleCollectUserEmail, handleCollectUserAvailability, handleThankYouMessage]);
  chatWidgetSetters.setInputMode('text');
  chatWidgetSetters.setInfoToSet('inquiry');
  // You might set a state for 'awaitingProductInfo'
};

export const handleRequestEmployeeSourcing = () => {
  sendBotMessage("Unlike traditional recruiting, we have a trusted network on subject matter experts who can guarantee you a reliable and skilled employee. Please describe the ideal candidate you are looking for.");
  chatWidgetSetters.setNextQuestions([
    handleCollectUserEmail, handleCollectUserAvailability, handleThankYouMessage]);
  // For simplicity, we'll keep the input mode as 'text' after this.
  // In a real scenario, you might offer new options here (e.g., "Leave Message", "Speak Now")
  chatWidgetSetters.setInputMode('text');
  chatWidgetSetters.setInfoToSet('inquiry');
};

export const handleGeneralInquiry = () => {
  sendBotMessage("How can we help you?");
  chatWidgetSetters.setInputMode('text');
  chatWidgetSetters.setInfoToSet('inquiry');
};

export const handleGreeting = () => {
  sendBotMessage("How can I assist you today?");
  chatWidgetSetters.setOptionsMapping(chatOptions);
  chatWidgetSetters.setInputMode('options'); // After a greeting, maybe offer options
};

export const handleDefaultResponse = () => {
  sendBotMessage("Thanks for your message! We'll get back to you shortly.");
  chatWidgetSetters.setInputMode('text');
};

export const handleCollectUserEmail = () => {
    sendBotMessage("Could you please provide your email address?");
    chatWidgetSetters.setInputMode('text');
    chatWidgetSetters.setInfoToSet('email');
    // You might set a state flag like `awaitingEmail` to process the next input specifically as an email.
}

export const handleCollectUserPhone = () => {
    sendBotMessage("Could you please provide your number? We won't contact you for anything else.");
    chatWidgetSetters.setInputMode('text');
    chatWidgetSetters.setInfoToSet('phone');
    // You might set a state flag like `awaitingEmail` to process the next input specifically as an email.
}

export const handleCollectUserContactOption = () => {
    sendBotMessage("What is your preferrece for contact? Email or Phone?");
    chatWidgetSetters.setOptionsMapping(contactOptions);
    chatWidgetSetters.setInputMode('options');
    // You might set a state flag like `awaitingEmail` to process the next input specifically as an email.
}

export const handleCollectUserContact = () => {
    sendBotMessage("How can we reach you? Please provide your email address or phone number.");
    chatWidgetSetters.setInputMode('text');
    chatWidgetSetters.setInfoToSet('email');
    // You might set a state flag like `awaitingEmail` to process the next input specifically as an email.
}

export const handleCollectUserAvailability = () => {
    sendBotMessage("What are you free to talk? Please provide a date and time that works for you.");
    chatWidgetSetters.setInputMode('text');
    chatWidgetSetters.setInfoToSet('availability');
    // You might set a state flag like `awaitingUserName`
}

export const handleCollectUserName = () => {
    sendBotMessage("What's your name, please?");
    chatWidgetSetters.setInputMode('text');
    chatWidgetSetters.setInfoToSet('name');
    // You might set a state flag like `awaitingUserName`
}

export const handleThankYouMessage = (message = "") => {
    if (message != "") sendBotMessage(message);
    else sendBotMessage("Thank you for reaching out! We will get back to you soon! Do you have anotherinquiry?");
    chatWidgetSetters.setOptionsMapping(yesOrNoOptions);
    chatWidgetSetters.setInputMode('options');
    // Optionally, you can reset the chat or provide further instructions
};

export const handleCloseChat = () => {
    sendBotMessage("Thank you for chatting with us! If you have any more questions, feel free to reach out again.");
    chatWidgetSetters.setInputMode('none');
    chatWidgetSetters.sendInfo();
    // Optionally, you can reset the chat or provide further instructions
};

export const chatOptions = [
    { label: "IT consulting", value: "it_consulting_request" },
    { label: "Business Intelligence", value: "business_intelligence_request" },
    { label: "Employee Sourcing", value: "employee_sourcing_request" },
    { label: "Other", value: "general_inquiry" },
];

// Map for quick access based on value
export let botResponseMap = {
  "it_consulting_request": handleRequestITConsulting,
  "business_intelligence_request": handleRequestBusinessIntelligence,
  "employee_sourcing_request": handleRequestEmployeeSourcing,
  "general_inquiry": handleGeneralInquiry,
  "email": handleCollectUserEmail,
  "phone": handleCollectUserPhone,
  "yes": handleGreeting,
  "no": handleCloseChat,
};

export const contactOptions = [
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
];

export const yesOrNoOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
];