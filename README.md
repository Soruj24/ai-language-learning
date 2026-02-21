# LinguaAI - AI-Powered Language Learning Platform

LinguaAI is a modern, adaptive language learning platform that leverages Artificial Intelligence to create personalized learning experiences. It features real-time lesson generation, interactive exercises, speech analysis, and progress tracking.

![LinguaAI Dashboard Preview](https://via.placeholder.com/800x400?text=LinguaAI+Dashboard+Preview)

## 🚀 Features

- **AI-Generated Lessons**: Dynamic lesson plans created on-the-fly based on your level and interests using LangChain and LLMs.
- **Interactive Lesson UI**: 
  - Step-by-step learning flow (Intro → Vocabulary → Grammar → Examples → Practice → Quiz).
  - Audio pronunciation for vocabulary.
  - Real-time feedback on exercises.
  - Gamified completion with scores and progress tracking.
- **Smart Flashcards**: Spaced Repetition System (SRS) integration that automatically creates flashcards from mistakes.
- **Speech Trainer**: Pronunciation analysis and feedback.
- **Modern Authentication**: Secure login and registration with email/password and Google OAuth.
- **Offline Support**: PWA capabilities with offline lesson saving and progress syncing.
- **Dashboard**: Comprehensive analytics, daily streaks, and learning path management.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/) primitives.
- **Database**: [MongoDB](https://www.mongodb.com/) (via Mongoose).
- **AI & ML**: 
  - [LangChain](https://js.langchain.com/) for agent orchestration.
  - [Vercel AI SDK](https://sdk.vercel.ai/docs) for streaming responses.
- **State Management**: React Hooks & Context.
- **Icons**: [Lucide React](https://lucide.dev/).
- **Animation**: [Framer Motion](https://www.framer.com/motion/).

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ installed.
- MongoDB instance (local or Atlas).
- Ollama installed and running (for local LLM).
- API Keys for Google OAuth (optional).

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Soruj24/ai-language-learning.git
    cd ai-language-learning
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add the following variables:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    NEXTAUTH_SECRET=your_nextauth_secret
    NEXTAUTH_URL=http://localhost:3000
    OLLAMA_BASE_URL=http://localhost:11434
    OLLAMA_MODEL=llama3.2
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Open the app**:
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
app/
├── (auth)/             # Authentication routes (Login/Register)
├── (dashboard)/        # Protected dashboard routes
├── api/                # API Routes (Next.js App Router)
├── components/         # Reusable React components
│   ├── auth/           # Auth forms
│   ├── dashboard/      # Dashboard widgets & Lesson views
│   └── ui/             # Radix UI + Tailwind primitives
├── lib/                # Utilities and Logic
│   ├── ai/             # AI Agents & Tools (LangChain)
│   ├── hooks/          # Custom React Hooks (useOffline, useSync)
│   ├── models/         # Mongoose Models
│   └── types/          # TypeScript Interfaces
└── public/             # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
