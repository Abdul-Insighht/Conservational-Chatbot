"""
Simple Q&A Chatbot using LangChain and Google Gemini 2.0 Flash
"""
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, AIMessage
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain.prompts import PromptTemplate

class GeminiChatbot:
    def __init__(self, api_key):
        """Initialize the chatbot with Gemini 2.0 Flash model"""

        os.environ["GOOGLE_API_KEY"] = api_key
        
        # Gemini 2.0 Flash model
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",  # Gemini 2.0 Flash model
            temperature=0.7,
            max_tokens=1000,
            top_p=0.85
        )
        
        # Set up memory to remember conversation history
        self.memory = ConversationBufferMemory(
            return_messages=True,
            memory_key="chat_history"
        )
        
        # Create a custom prompt template
        self.prompt = PromptTemplate(
            input_variables=["chat_history", "input"],
            template="""You are a helpful AI assistant powered by Google's Gemini 2.0 Flash model. 
            You provide accurate, helpful, and engaging responses to user questions.

            Previous conversation:
            {chat_history}

            Human: {input}
            AI Assistant:"""
        )
        
        # Create the conversation chain
        self.conversation = ConversationChain(
            llm=self.llm,
            prompt=self.prompt,
            memory=self.memory,
            verbose=False
        )
    
    def ask(self, question):
        """Ask a question to the chatbot"""
        try:
            response = self.conversation.predict(input=question)
            return response
        except Exception as e:
            return f"Sorry, I encountered an error: {str(e)}"
    
    def clear_memory(self):
        """Clear the conversation memory"""
        self.memory.clear()
        print("Conversation history cleared!")

def main():
    """Main function to run the chatbot"""
    # Your Gemini API key
    API_KEY = "AIzaSyBYnQi_0ARDIrlIaGw--ETJ6MgpSQgUXDE"
    
    print("🤖 Gemini 2.0 Flash Chatbot")
    print("=" * 40)
    print("Type 'quit' to exit, 'clear' to clear memory")
    print("=" * 40)
    
    # Initialize the chatbot
    try:
        chatbot = GeminiChatbot(API_KEY)
        print("✅ Chatbot initialized successfully!")
        print()
    except Exception as e:
        print(f"❌ Error initializing chatbot: {e}")
        return
    
    # Main chat loop
    while True:
        try:
            # Get user input
            user_input = input("You: ").strip()
            
            # Check for exit commands
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("👋 Goodbye! Thanks for chatting!")
                break
            
            # Check for clear command
            if user_input.lower() == 'clear':
                chatbot.clear_memory()
                continue
            
            # Skip empty inputs
            if not user_input:
                continue
            
            # Get response from chatbot
            print("🤖 Thinking...")
            response = chatbot.ask(user_input)
            print(f"Bot: {response}")
            print()
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye! Thanks for chatting!")
            break
        except Exception as e:
            print(f" An error occurred: {e}")
            print()

if __name__ == "__main__":
    main()
