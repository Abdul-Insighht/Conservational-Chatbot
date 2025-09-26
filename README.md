# Chatbot Project

This project is a chatbot application built with **Node.js** (server) and **Python** (chatbot logic using Gemini API).  
It provides an interface for conversational AI and can be extended with custom features.

---

## 📂 Project Structure
```
Chatbot/
├── gemini_chatbot.py       # Python script for chatbot logic
├── server.js               # Node.js backend server
├── setup.js                # Setup script
├── package.json            # Node.js dependencies and scripts
├── package-lock.json       # Dependency lock file
└── node_modules/           # Installed Node.js dependencies
```

---

## 🚀 Features
- Node.js backend server
- Python integration (`gemini_chatbot.py`)
- Uses Google Generative AI (Gemini API)
- Easy to extend with custom logic

---

## 🛠️ Requirements
Make sure you have installed:

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [Python 3.8+](https://www.python.org/)
- `pip` for Python dependencies
- `npm` for Node.js dependencies

---

## ⚙️ Installation

1. **Clone or extract the project**
   ```bash
   unzip "Chatbot (2).zip"
   cd Chatbot
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   *(If `requirements.txt` is missing, manually install required libraries such as `google-generativeai`, `flask`, etc.)*

---

## ▶️ Running the Project

1. **Start the Node.js server**
   ```bash
   node server.js
   ```

   This will start the backend server at `http://localhost:5000`.

2. **Run the Python chatbot**
   ```bash
   python gemini_chatbot.py
   ```

3. The chatbot will now be ready to handle requests.

---

## 📌 Notes
- Ensure your **Google Gemini API key** is set in the environment variables before running the chatbot.
- Example:
  ```bash
  export GEMINI_API_KEY="your_api_key_here"
  ```

---

## 🤝 Contributing
Feel free to fork this repository and improve the chatbot. Pull requests are welcome!

---

## 📜 License
This project is licensed under the MIT License.
