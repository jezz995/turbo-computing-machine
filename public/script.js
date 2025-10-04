const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// --- New elements for clear button ---
const clearInputBtn = document.getElementById("clear-input");

// Array to store conversation history
const conversationHistory = [];

// --- Function to display the opening message ---
function showOpeningConversation() {
  const welcomeMessage = "Hello ! apa kabar ? Tanyakan apapun pada saya";
  // Add bot's opening message to history and display it
  conversationHistory.push({ role: "model", text: welcomeMessage });
  appendMessage("bot", welcomeMessage);
}

// --- Event listener for the clear button ---
clearInputBtn.addEventListener("click", () => {
  input.value = "";
  clearInputBtn.style.display = "none";
  input.focus();
});

// --- Event listener to show/hide clear button based on input ---
input.addEventListener("input", () => {
  if (input.value.trim() !== "") {
    clearInputBtn.style.display = "block";
  } else {
    clearInputBtn.style.display = "none";
  }
});

// --- Event listener for quick action buttons ---
document.querySelectorAll(".quick-action-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const message = button.getAttribute("data-message");
    input.value = message;
    // Optionally, trigger the form submission
    form.dispatchEvent(new Event("submit", { cancelable: true }));
  });
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;
  // Add user message to history and display it
  conversationHistory.push({ role: "user", text: userMessage });
  appendMessage("user", userMessage);
  input.value = "";

  // Display a "thinking" message from the bot
  const thinkingMessageElement = appendMessage("bot", "Gemini is thinking...");

  // Hide clear button after sending
  clearInputBtn.style.display = "none";

  try {
    // Send the conversation history to the backend
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation: conversationHistory }),
    });

    const data = await response.json();

    // Remove the "thinking" message
    chatBox.removeChild(thinkingMessageElement);

    if (data.success) {
      // Add model's response to history and display it
      conversationHistory.push({ role: "model", text: data.data });
      appendMessage("bot", data.data);
    } else {
      // Display error message from the backend
      appendMessage("bot", `Error: ${data.message}`);
    }
  } catch (error) {
    // Remove the "thinking" message
    chatBox.removeChild(thinkingMessageElement);
    console.error("Error sending message:", error);
    appendMessage("bot", "Oops! Something went wrong. Please try again.");
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  if (sender === "bot") {
    // Render markdown for bot messages to support lists, tables, etc.
    msg.innerHTML = marked.parse(text);
  } else {
    // Use textContent for user messages for security
    msg.textContent = text;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the message element so it can be removed later
}

// --- Show the opening message when the page loads ---
showOpeningConversation();
