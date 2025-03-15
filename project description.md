The goal of this project is to build an AI-powered chatbot designed specifically for contractors or stakeholders involved in constructing new hotels according to predefined brand regulations and guidelines.

Tech Stack:

Frontend: React with Vite

Backend: FastAPI (Python)

AI and RAG Framework: LangChain integrated with GPT-4o

Vector Database: Faiss for embedding and retrieving relevant documentation

Database: SQLite

Authentication: JWT with secure password hashing

User Experience Flow:

Sign-up/Login: Users initially land on an authentication page. New users must sign up, while returning users can log in.

Region Selection:

Upon sign-up, users select their region (e.g., Middle East, Europe, North America). Each region has its own specific set of regulatory documents.

The backend stores the user's region choice and associates it with their account to ensure correct document retrieval.

Chat Interface:

After login, users are redirected to the chatbot dashboard.

Interface layout:

Left Pane: Displays previous chat conversations, allowing easy access and context retrieval.

Central Pane: Contains the chat interface, including message input and conversational history.

Top-Right Corner: Shows the user's profile logo, customizable or defaulted based on the user's information.

Functional Requirements:

Document Retrieval: The chatbot strictly retrieves and responds with information from the official brand standards and regulations documents. If no information matches the query, the chatbot politely informs the user that no relevant data is available.

Region-Specific Data Management: Documents are embedded separately by region into the Faiss vector store.

Conversation Memory: Maintains context-aware interactions within each session.

Audit and Logging:

Implement logging of user interactions to monitor chatbot usage, ensure compliance, and facilitate audits.

Testing and Quality Assurance:

Develop comprehensive automated tests using Pytest for backend endpoints, including authentication, API responses, and document retrieval accuracy.

Conduct frontend testing with Jest to verify user interactions, navigation flow, and overall UI functionality.

Performance and Security:

Employ asynchronous processing for non-blocking operations, especially during calls to GPT-4o.

Ensure robust security through JWT-based authentication and secure hashing for storing user passwords.

SQLite will handle basic CRUD operations for user data, profiles, and chat session metadata.

This architecture will ensure scalability, high performance, robust security, and a seamless user experience tailored explicitly for stakeholders interacting with brand-specific hotel construction standards.