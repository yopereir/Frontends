// botResponses.js

// This object will hold the state setters from ChatWidget
let chatWidgetSetters = {};

export const initializeBotResponses = (setMessages, setInputMode, setUserEmail, setUserPhone, setUserName, setUserMessage, setInfoToSet, setUserAvailability, setOptionsMapping, setOptionsFunctionMapping, setNextQuestions, sendInfo, setWaitForInput) => {
  chatWidgetSetters = { setMessages, setInputMode, setUserEmail, setUserPhone, setUserName, setUserMessage, setInfoToSet, setUserAvailability, setOptionsMapping, setOptionsFunctionMapping, setNextQuestions, sendInfo, setWaitForInput };
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

export const handleGetAQuote = () => {
  sendBotMessage("We offer {{ .Site.Params.trade }} solutions in and around the {{ .Site.Params.city }} area. Please provide a brief description of what you want to achieve.");
  chatWidgetSetters.setNextQuestions([
    handleCollectUserContactOption,handleCollectUserAvailability, handleThankYouMessage]);
  chatWidgetSetters.setInputMode('text');
  chatWidgetSetters.setInfoToSet('message');
  // You might set a state for 'awaitingOrderNumber' if you need to validate the next input
};

export const handleProjectStatus = () => {
  sendBotMessage("Please provide us with your name and Project Address so we can provide you the latest status of the Project.");
  chatWidgetSetters.setNextQuestions([
    handleCollectUserContactOption, handleThankYouMessage]);
  // For simplicity, we'll keep the input mode as 'text' after this.
  // In a real scenario, you might offer new options here (e.g., "Leave Message", "Speak Now")
  chatWidgetSetters.setInputMode('text');
  chatWidgetSetters.setInfoToSet('message');
};

export const handleGeneralMessage = () => {
  sendBotMessage("How can we help you?");
  chatWidgetSetters.setNextQuestions([
    handleCollectUserEmail, handleThankYouMessage]);
  chatWidgetSetters.setInputMode('text');
  chatWidgetSetters.setInfoToSet('message');
};

export const handleGreeting = () => {
  sendBotMessage("How can I assist you today?");
  chatWidgetSetters.setOptionsMapping(chatOptions);
  chatWidgetSetters.setInfoToSet('');
  chatWidgetSetters.setInputMode('options'); // After a greeting, maybe offer options
};

export const handleDefaultResponse = () => {
  sendBotMessage("Thanks for your message! We'll get back to you shortly.");
  chatWidgetSetters.setInfoToSet('');
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
    chatWidgetSetters.setNextQuestions([
        handleCollectUserAvailability, handleThankYouMessage]);
    // You might set a state flag like `awaitingEmail` to process the next input specifically as an email.
}

export const handleCollectUserContactOption = () => {
    sendBotMessage("What is your preference for contact? Email or Phone?");
    chatWidgetSetters.setOptionsMapping(contactOptions);
    chatWidgetSetters.setInputMode('options');
    chatWidgetSetters.setInfoToSet('');
    chatWidgetSetters.setWaitForInput(true);
    // You might set a state flag like `awaitingEmail` to process the next input specifically as an email.
}

export const handleCollectUserContact = () => {
    sendBotMessage("How can we reach you? Please provide your email address or phone number.");
    chatWidgetSetters.setInputMode('text');
    chatWidgetSetters.setInfoToSet('email');
    // You might set a state flag like `awaitingEmail` to process the next input specifically as an email.
}

export const handleCollectUserAvailability = () => {
    sendBotMessage("When are you free to talk? Please provide a date and time that works for you.");
    chatWidgetSetters.setInputMode('text');
    chatWidgetSetters.setInfoToSet('availability');
    // You might set a state flag like `awaitingUserName`
}

export const handleCollectUserName = () => {
    sendBotMessage("Please state your name and/or company name.");
    chatWidgetSetters.setInputMode('text');
    chatWidgetSetters.setInfoToSet('name');
    // You might set a state flag like `awaitingUserName`
}

export const handleThankYouMessage = (message = "") => {
    if (message != "") sendBotMessage(message);
    else sendBotMessage("Thank you for reaching out! We will get back to you soon! Do you have another inquiry?");
    chatWidgetSetters.setOptionsMapping(yesOrNoOptions);
    chatWidgetSetters.setInfoToSet('');
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
    { label: "Get a Quote", value: "get_a_quote" },
    { label: "Project Status", value: "project_status" },
    { label: "General Inquiry", value: "general_message" },
];

// Map for quick access based on value
export let botResponseMap = {
  "get_a_quote": handleGetAQuote,
  "project_status": handleProjectStatus,
  "general_message": handleGeneralMessage,
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