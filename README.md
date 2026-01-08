# PathPilot 🚀

**Your AI-powered career co-pilot for FAANG prep.**

PathPilot is a comprehensive learning platform that helps developers prepare for top tech companies by providing personalized roadmaps, DSA practice, mock interviews, and project tracking—all driven by AI and your resume.

## ✨ Features

### 🎯 Core Features

- **AI-Powered Roadmaps**: Generate personalized learning paths based on your resume and career goals
- **DSA Practice**: Curated coding problems with progress tracking, bookmarks, and status management
- **Mock Interviews**: AI-generated interview questions tailored to your resume and experience
- **Project Tracker**: Showcase your projects and track your development progress
- **Quiz Builder**: Create and take custom quizzes to test your knowledge
- **Leaderboard**: Compete with other users and track your rankings
- **Skill Swap**: Exchange skills with other learners in the community
- **Resume Analysis**: Upload your resume (PDF) for AI-powered analysis and insights
- **AI Chatbot**: Interactive AI assistant available throughout the platform
- **User Profiles**: Track your stats, earn badges, and view your learning journey

### 📊 User Statistics

- Track quizzes taken, swaps completed, and learning hours
- Monitor accuracy, streaks, and total scores
- View recent activity and achievements
- Earn badges for milestones

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Confetti** - Celebration animations

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Passport.js** - Authentication middleware (Google OAuth support)
- **OpenAI/OpenRouter** - AI integration for roadmaps, interviews, and chatbot
- **Multer** - File upload handling
- **PDF-Parse** - Resume parsing
- **Bcryptjs** - Password hashing

## 📁 Project Structure

```
pathpilot/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── AIChatbot.jsx
│   │   │   └── Navbar.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── DashBoard.jsx
│   │   │   ├── Roadmap.jsx
│   │   │   ├── DSA.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── MockInterview.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Skills.jsx
│   │   │   ├── Swaps.jsx
│   │   │   ├── QuizBuilder.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   └── SkillSwap.jsx
│   │   ├── App.jsx         # Main app component with routing
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── server/                  # Node.js backend application
    ├── config/
    │   ├── db.js           # MongoDB connection
    │   └── passport.js     # Passport configuration
    ├── controllers/
    │   └── authController.js
    ├── middleware/
    │   └── auth.js         # JWT authentication middleware
    ├── models/             # Mongoose models
    │   ├── User.js
    │   ├── DSAProblem.js
    │   ├── Project.js
    │   ├── Quiz.js
    │   ├── SkillSwap.js
    │   └── Swap.js
    ├── routes/             # API routes
    │   ├── auth.js
    │   ├── users.js
    │   ├── skills.js
    │   ├── quizzes.js
    │   ├── leaderboard.js
    │   ├── swaps.js
    │   ├── resume.js
    │   ├── ai.js
    │   ├── dsa.js
    │   ├── projects.js
    │   └── skillswap.js
    ├── seed/               # Database seeding scripts
    │   ├── dsa.js
    │   └── problemSiteData.json
    ├── uploads/            # Uploaded files (resumes)
    ├── app.js              # Express app configuration
    ├── server.js           # Server entry point
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <https://github.com/sangeeta2003/pathpilot>
   cd pathpilot
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Set up environment variables**

   Create a `.env` file in the `server` directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   OPENAI_API_KEY=your_openai_or_openrouter_api_key
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   ```

5. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm start
   # or with nodemon for auto-reload
   npx nodemon server.js
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: `http://localhost:5173` (Vite default port)
   - Backend API: `http://localhost:5000`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/google` - Google OAuth authentication

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID

### DSA
- `GET /api/dsa/problems` - Get all DSA problems
- `GET /api/dsa/problems/:id` - Get problem by ID
- `POST /api/dsa/progress` - Update problem progress

### Projects
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers

### AI Features
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/roadmap` - Generate learning roadmap
- `POST /api/ai/mockinterview` - Generate mock interview questions

### Resume
- `POST /api/resume/upload` - Upload and parse resume
- `GET /api/resume/data` - Get parsed resume data

### Skills & Swaps
- `GET /api/skills` - Get all skills
- `POST /api/skillswap` - Create skill swap request
- `GET /api/swaps` - Get all swaps

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard rankings

## 🔐 Authentication

PathPilot uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid token in the request headers:

```
Authorization: Bearer <token>
```

The token is stored in localStorage on the frontend and automatically included in API requests.

## 🗄️ Database Models

### User
- Profile information (name, email, avatar, bio)
- Skills (offered and wanted)
- Statistics (quizzes, swaps, hours, scores, streaks)
- Badges and achievements
- Reviews and activity log
- DSA progress tracking
- Resume data

### DSAProblem
- Problem details (title, description, difficulty, tags)
- Links to external problem sites
- Solutions and hints

### Project
- Project information (title, description, tech stack)
- Links and repository URLs
- Status and completion date

### Quiz
- Quiz questions and answers
- Scoring and time limits
- Categories and difficulty

### SkillSwap & Swap
- Skill exchange requests
- Matching and status tracking

## 🎨 Features in Detail

### AI-Powered Roadmap
Upload your resume or describe your career goals, and PathPilot generates a personalized learning roadmap with:
- Step-by-step learning path
- Recommended resources
- Skill milestones
- Timeline estimates

### DSA Practice
- Browse problems by difficulty and topic
- Track your progress (solved, bookmarked)
- View problem details and solutions
- Monitor your DSA journey

### Mock Interviews
- Upload your resume for context
- Receive AI-generated interview questions
- Practice with questions tailored to your experience
- Get feedback and suggestions

### Skill Swap
- Offer skills you can teach
- Request skills you want to learn
- Match with other users
- Track swap history and reviews

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- OpenAI/OpenRouter for AI capabilities
- MongoDB for database services
- All the open-source libraries that made this project possible

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Built with ❤️ for developers preparing for their dream tech careers**
