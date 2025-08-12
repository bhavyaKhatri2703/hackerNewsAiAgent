# Hacker News AI Agent

An AI-powered agent that fetches and ranks the latest Hacker News stories relevant to your queries using Retrieval-Augmented Generation (RAG). Users can input a question or topic of interest, and the system finds and presents related articles in real-time.

## Features
- Retrieves latest Hacker News stories.
- Uses RAG to match stories to user queries.
- Ranks results based on relevance.
- Real-time updates powered by RabbitMQ.
- Clean, responsive web interface.

## Tech Stack
- **Frontend:** React, Tailwind CSS  
- **Backend:** Go (Gin Framework)  
- **Database:** PostgreSQL  
- **Communication:** gRPC, RabbitMQ  
- **AI Processing:** LangChain  
