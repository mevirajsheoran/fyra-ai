# Fyra AI Fitness Assistant - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [Frontend Components](#frontend-components)
6. [API Routes](#api-routes)
7. [Backend (Convex)](#backend-convex)
8. [Custom Hooks](#custom-hooks)
9. [Data Flow](#data-flow)
10. [Configuration Files](#configuration-files)
11. [Voice Assistant System](#voice-assistant-system)
12. [AI Integration](#ai-integration)
13. [Authentication & Authorization](#authentication--authorization)
14. [Database Schema](#database-schema)
15. [Setup & Deployment](#setup--deployment)
16. [Key Algorithms](#key-algorithms)

---

## Project Overview

**Fyra AI** is a modern, AI-powered fitness assistant web application that generates personalized workout and diet plans through voice conversations. Users interact with an AI assistant via speech recognition, answer questions about their fitness goals, and receive customized fitness programs generated using Google's Gemini AI.

### Key Capabilities
- **Voice-based conversation** with AI fitness assistant
- **Personalized workout plans** generated based on user profile
- **Customized diet plans** with calorie calculations
- **User profile management** with multiple fitness plans
- **Real-time speech recognition and synthesis**
- **Fallback system** with 72 pre-generated plans

### Target Users
- Fitness enthusiasts seeking personalized programs
- Beginners looking for structured workout guidance
- Users preferring voice interaction over forms
- People wanting AI-generated fitness solutions

---

## Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 15.5.9 (React 18.3.1)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with custom silver/chrome theme
- **UI Components**: Radix UI (Accordion, Tabs, Slot)
- **Icons**: Lucide React
- **State Management**: React Hooks + Convex React hooks
- **Routing**: Next.js App Router

### Backend
- **Database**: Convex (serverless backend)
- **Authentication**: Clerk (with Convex integration)
- **AI**: Google Generative AI (Gemini 2.5 Flash/Pro)
- **API Routes**: Next.js API Routes

### Voice Features
- **Speech Recognition**: Web Speech API (browser-native)
- **Speech Synthesis**: Web Speech Synthesis API
- **Language**: English (en-US)

### Development Tools
- **Build Tool**: Turbopack (Next.js)
- **Linting**: ESLint 9
- **Package Manager**: npm
- **Type Checking**: TypeScript

---

## Project Structure

```
Fyra-AI fitness assistant/
├── convex/                          # Convex backend
│   ├── _generated/                   # Auto-generated Convex types
│   │   ├── api.d.ts
│   │   ├── api.js
│   │   ├── dataModel.d.ts
│   │   ├── server.d.ts
│   │   └── server.js
│   ├── auth.config.ts               # Clerk authentication config
│   ├── http.ts                       # HTTP routes (webhooks)
│   ├── plans.ts                      # Plan CRUD operations
│   ├── schema.ts                     # Database schema
│   ├── users.ts                      # User sync operations
│   └── tsconfig.json
│
├── public/                           # Static assets
│   ├── ai-avatar.png                 # AI assistant avatar
│   ├── hero-ai.png                   # Hero images
│   ├── hero-ai2.png
│   ├── hero-ai3.png
│   └── screenshot-for-readme.png
│
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── (auth)/                   # Auth routes (grouped)
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── api/                      # API routes
│   │   │   ├── chat/                 # Chat conversation API
│   │   │   ├── extract-data/         # Data extraction API
│   │   │   └── generate-plan/        # Plan generation API
│   │   ├── generate-program/        # Voice conversation page
│   │   ├── profile/                  # User profile page
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Homepage
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # Reusable UI components
│   │   │   ├── accordion.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── tabs.tsx
│   │   ├── voice-assistant/          # Voice-specific components
│   │   │   ├── ConversationDisplay.tsx
│   │   │   ├── StatusIndicator.tsx
│   │   │   └── VoiceButton.tsx
│   │   ├── AIVisualDisplay.tsx
│   │   ├── BackgroundEffects.tsx
│   │   ├── CornerElements.tsx
│   │   ├── CyberButton.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── NoFitnessPlan.tsx
│   │   ├── ProfileHeader.tsx
│   │   ├── RoboticFrame.tsx
│   │   ├── StatsCard.tsx
│   │   ├── TerminalOverlay.tsx
│   │   └── UserPrograms.tsx
│   │
│   ├── constants/                   # App constants
│   │   └── index.ts
│   │
│   ├── data/                        # Static data
│   │   └── preGeneratedPlans.json   # 72 fallback plans
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useSpeechRecognition.ts
│   │   ├── useSpeechSynthesis.ts
│   │   └── useVoiceAssistant.ts     # Main voice hook
│   │
│   ├── lib/                         # Utility libraries
│   │   ├── gemini.ts                # Gemini AI client
│   │   ├── prompts.ts               # AI prompts
│   │   └── utils.ts                 # Utility functions
│   │
│   ├── providers/                   # React providers
│   │   └── ConvexClerkProvider.tsx  # Convex + Clerk integration
│   │
│   ├── types/                       # TypeScript types
│   │   ├── speech-recognition.d.ts  # Speech API types
│   │   └── voice-assistant.ts       # Voice assistant types
│   │
│   └── middleware.ts                # Next.js middleware (auth)
│
├── components.json                  # shadcn/ui config
├── eslint.config.mjs               # ESLint config
├── next.config.ts                   # Next.js config
├── package.json                     # Dependencies
├── postcss.config.mjs              # PostCSS config
├── tailwind.config.ts              # Tailwind config
└── tsconfig.json                   # TypeScript config
```

---

## Core Features

### 1. Voice-Based Conversation
Users interact with the AI assistant through natural voice conversation. The system:
- Uses browser-native Web Speech API for recognition
- Provides real-time transcription feedback
- Handles turn-taking between user and AI
- Automatically starts listening after AI speaks

### 2. Personalized Plan Generation
- Collects user health data through conversation
- Generates workout plans tailored to goals, experience, and preferences
- Creates diet plans with calculated calorie targets
- Uses BMR (Basal Metabolic Rate) calculations for accuracy

### 3. Multi-Plan Management
- Users can have multiple fitness plans
- Only one plan can be active at a time
- Plans are stored persistently in Convex database
- Easy switching between plans

### 4. Fallback System
- 72 pre-generated plans covering various profiles
- Progressive matching algorithm (exact → gender → default)
- Ensures service availability even if AI fails
- Graceful degradation

### 5. Real-Time UI Feedback
- Visual indicators for listening/speaking states
- Animated voice waveforms
- Status badges and progress indicators
- Smooth transitions between states

---

## Frontend Components

### Layout Components

#### `src/app/layout.tsx`
**Purpose**: Root layout wrapper for entire application

**Features**:
- Wraps app with `ConvexClerkProvider` for auth + database
- Includes `Navbar` and `Footer` on all pages
- Applies custom fonts (Geist Sans, Geist Mono)
- Sets up grid background pattern
- Configures metadata (title, description)

**Key Code**:
```tsx
<ConvexClerkProvider>
  <html lang="en">
    <body>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </body>
  </html>
</ConvexClerkProvider>
```

#### `src/app/page.tsx` (Homepage)
**Purpose**: Landing page with hero section and program gallery

**Components Used**:
- `BackgroundEffects`: Animated background
- `AIVisualDisplay`: AI avatar display
- `TerminalOverlay`: Terminal-style overlay
- `StatsCard`: Statistics display
- `CyberButton`: Styled CTA buttons
- `UserPrograms`: Program gallery section

**Sections**:
1. **Hero Section**: Main headline, description, stats, CTA
2. **User Programs**: Gallery of example programs

### Voice Assistant Components

#### `src/app/generate-program/page.tsx`
**Purpose**: Main voice conversation interface

**State Management**:
- Uses `useVoiceAssistant` hook for all voice logic
- Manages conversation state, status, errors
- Handles call lifecycle (start/end)

**UI Elements**:
- **AI Card**: Shows AI avatar, status, speaking animations
- **User Card**: Shows user image, listening/speaking status
- **Conversation Display**: Shows message history
- **Controls**: Microphone button, start/end call button

**Key Features**:
- Real-time transcript display
- Visual feedback for listening/speaking
- Automatic state transitions
- Error handling and recovery

#### `src/components/voice-assistant/VoiceButton.tsx`
**Purpose**: Microphone button with visual states

**States**:
- Idle: Gray, inactive
- Listening: Blue, pulsing
- Speaking: Silver, animated
- Processing: Disabled

**Visual Feedback**:
- Color changes based on state
- Pulsing animation when active
- Icon changes (mic vs. stop)

#### `src/components/voice-assistant/ConversationDisplay.tsx`
**Purpose**: Displays conversation messages

**Features**:
- Shows user and AI messages
- Displays live transcript while listening
- Scrolls to latest message
- Different styling for user vs. AI

#### `src/components/voice-assistant/StatusIndicator.tsx`
**Purpose**: Shows current conversation status

**Statuses**:
- Idle: Ready to start
- Listening: Waiting for user input
- Processing: Processing response
- Speaking: AI is speaking
- Generating: Creating fitness plan

### Profile Components

#### `src/app/profile/page.tsx`
**Purpose**: User profile with fitness plans

**Features**:
- Displays all user's fitness plans
- Plan selector (tabs/buttons)
- Workout plan viewer (accordion by day)
- Diet plan viewer (meals list)
- Shows active plan indicator

**Data Flow**:
- Queries Convex for user plans
- Filters for active plan
- Allows plan selection

#### `src/components/ProfileHeader.tsx`
**Purpose**: User profile header

**Displays**:
- User avatar
- User name
- Profile stats (if any)

#### `src/components/NoFitnessPlan.tsx`
**Purpose**: Empty state when user has no plans

**Features**:
- Encourages plan generation
- Links to generate-program page
- Friendly messaging

### UI Components

#### `src/components/CyberButton.tsx`
**Purpose**: Styled button component with cyber/silver theme

**Variants**:
- `primary`: Main CTA (silver/chrome gradient)
- `outline`: Secondary action (border only)

**Sizes**:
- `sm`, `md`, `lg`

**Features**:
- Hover effects
- Icon support
- Link integration

#### `src/components/StatsCard.tsx`
**Purpose**: Displays statistics with icon

**Props**:
- `value`: Stat value (e.g., "500+")
- `label`: Stat label
- `icon`: React node icon

#### `src/components/AIVisualDisplay.tsx`
**Purpose**: Displays AI avatar with effects

**Features**:
- Image display
- Glow effects
- Border animations
- Responsive sizing

#### `src/components/BackgroundEffects.tsx`
**Purpose**: Animated background effects

**Effects**:
- Gradient overlays
- Particle animations
- Grid patterns

#### `src/components/CornerElements.tsx`
**Purpose**: Decorative corner elements for cards

**Style**: Cyberpunk/tech aesthetic

---

## API Routes

### `/api/chat` - Conversation Handler

**File**: `src/app/api/chat/route.ts`

**Method**: POST

**Purpose**: Returns deterministic questions for voice conversation

**Request Body**:
```typescript
{
  conversationHistory: Message[],
  turnNumber: number,
  userName: string | null
}
```

**Response**:
```typescript
{
  message: string,        // Question text
  isComplete: boolean    // Whether conversation is done
}
```

**Logic**:
- Hard-coded 3-question flow (no LLM)
- Questions array with placeholders
- Replaces `{name}` with userName
- Returns completion message after 3 turns

**Questions Flow**:
1. **Turn 1**: Age, gender, height, weight
2. **Turn 2**: Goal, activity level, experience, workout preference, days per week
3. **Turn 3**: Dietary restrictions, health conditions
4. **Turn 4+**: Completion message

**Why Deterministic?**
- Faster response (no API call)
- More reliable
- Lower cost
- Predictable flow

---

### `/api/extract-data` - Data Extraction

**File**: `src/app/api/extract-data/route.ts`

**Method**: POST

**Purpose**: Extracts structured health data from conversation using AI

**Request Body**:
```typescript
{
  conversationHistory: Message[]
}
```

**Response**:
```typescript
{
  data: UserHealthData,
  isComplete: boolean,
  missingFields: string[]
}
```

**Process**:
1. **Auth Check**: Verifies user authentication
2. **Build Prompt**: Formats conversation into extraction prompt
3. **Call Gemini**: Uses `gemini-2.5-flash` (fallback: `gemini-2.0-flash`)
4. **Parse JSON**: Extracts JSON from response (handles markdown)
5. **Fill Defaults**: Fills missing fields with defaults
6. **Return**: Structured data

**Default Values**:
```typescript
{
  name: "User",
  age: 25,
  gender: "male",
  weight: 70,
  height: 170,
  goal: "improve_fitness",
  activityLevel: "moderate",
  experienceLevel: "beginner",
  workoutPreference: "gym",
  daysPerWeek: 3,
  dietaryRestrictions: [],
  healthConditions: []
}
```

**Error Handling**:
- If extraction fails → returns defaults
- Always returns `isComplete: true` (graceful degradation)
- Logs missing fields for debugging

---

### `/api/generate-plan` - Plan Generation

**File**: `src/app/api/generate-plan/route.ts`

**Method**: POST

**Purpose**: Generates workout and diet plans using AI or fallback

**Request Body**:
```typescript
{
  userData: UserHealthData
}
```

**Response**:
```typescript
{
  success: boolean,
  planId: string,
  planName: string,
  workoutPlan: WorkoutPlan,
  dietPlan: DietPlan,
  usedFallback: boolean,
  dailyCalories: number
}
```

**Process Flow**:

#### Step 1: Normalize User Data
- Fills missing fields with defaults
- Ensures all required fields present

#### Step 2: Calculate Daily Calories
- Uses BMR formula (Mifflin-St Jeor):
  - **Male**: `10 × weight + 6.25 × height - 5 × age + 5`
  - **Female**: `10 × weight + 6.25 × height - 5 × age - 161`
- Applies activity multiplier:
  - Sedentary: 1.2
  - Light: 1.375
  - Moderate: 1.55
  - Active: 1.725
  - Very Active: 1.9
- Adjusts for goal:
  - Lose weight: -500 cal
  - Build muscle: +300 cal
  - Improve fitness: +100 cal

#### Step 3: Generate Workout Plan
**AI Path** (if API key exists):
1. Build workout prompt with user data
2. Call Gemini (`gemini-2.5-flash` → fallback `gemini-2.0-flash`)
3. Parse JSON from response
4. Normalize plan (ensure sets/reps are numbers)
5. Handle timeout (30s)

**Fallback Path** (if AI fails or no API key):
1. Get weight range category (50-65, 66-80, 81-95)
2. Map activity level (sedentary/light → sedentary, moderate → moderate, active/very_active → active)
3. Progressive matching:
   - Level 1: Exact match (gender + goal + activity + weight)
   - Level 2: Without weight (gender + goal + activity)
   - Level 3: Without activity (gender + goal)
   - Level 4: Gender only
   - Level 5: First plan (ultimate fallback)

#### Step 4: Generate Diet Plan
**AI Path**:
1. Build diet prompt with user data + calculated calories
2. Call Gemini (same model fallback)
3. Parse JSON
4. Normalize (ensure dailyCalories set)

**Fallback Path**:
- Uses same fallback plan as workout

#### Step 5: Save to Convex
1. Deactivate all existing plans for user
2. Create new plan with generated data
3. Set as active
4. Return plan ID

**Error Handling**:
- Timeout handling (30s per request)
- JSON parsing with regex extraction
- Emergency fallback on catastrophic errors
- Always returns a plan (never fails completely)

---

## Backend (Convex)

### Database Schema

**File**: `convex/schema.ts`

#### `users` Table
```typescript
{
  name: string,
  email: string,
  image?: string,
  clerkId: string
}
```
**Index**: `by_clerk_id` on `clerkId`

#### `plans` Table
```typescript
{
  userId: string,
  name: string,
  workoutPlan: {
    schedule: string[],
    exercises: Array<{
      day: string,
      routines: Array<{
        name: string,
        sets?: number,
        reps?: number,
        duration?: string,
        description?: string,
        exercises?: string[]
      }>
    }>
  },
  dietPlan: {
    dailyCalories: number,
    meals: Array<{
      name: string,
      foods: string[]
    }>
  },
  isActive: boolean
}
```
**Indexes**:
- `by_user_id` on `userId`
- `by_active` on `isActive`

---

### Convex Functions

#### `convex/plans.ts`

##### Mutations

**`createPlan`**
- **Purpose**: Creates new fitness plan
- **Process**:
  1. Deactivates all existing plans for user
  2. Inserts new plan
  3. Sets as active
- **Returns**: Plan ID

**`setActivePlan`**
- **Purpose**: Activates a specific plan
- **Process**:
  1. Verifies ownership
  2. Deactivates all plans
  3. Activates selected plan
- **Returns**: Plan ID

**`deletePlan`**
- **Purpose**: Deletes a plan
- **Process**:
  1. Verifies ownership
  2. Deletes plan
- **Returns**: `{ success: true }`

##### Queries

**`getUserPlans`**
- **Purpose**: Gets all plans for a user
- **Returns**: Array of plans

**`getActivePlan`**
- **Purpose**: Gets active plan for user
- **Returns**: Single plan or null

**`getPlanById`**
- **Purpose**: Gets plan by ID
- **Returns**: Plan or null

---

#### `convex/users.ts`

##### Mutations

**`syncUser`**
- **Purpose**: Syncs user from Clerk to Convex
- **Process**:
  1. Checks if user exists
  2. Creates if doesn't exist
  3. Returns early if exists
- **Used by**: Clerk webhook

**`updateUser`**
- **Purpose**: Updates user data
- **Process**:
  1. Finds user by clerkId
  2. Updates fields
- **Used by**: Clerk webhook

---

#### `convex/http.ts`

**Purpose**: HTTP routes for webhooks

**Route**: `/clerk-webhook`
- **Method**: POST
- **Purpose**: Handles Clerk user events
- **Events**:
  - `user.created`: Syncs new user
  - `user.updated`: Updates user data
- **Security**: Verifies webhook signature with Svix

---

### Authentication Configuration

**File**: `convex/auth.config.ts`

**Purpose**: Configures Clerk provider for Convex

**Configuration**:
```typescript
{
  providers: [{
    domain: "https://together-tomcat-63.clerk.accounts.dev",
    applicationID: "convex"
  }]
}
```

---

## Custom Hooks

### `useVoiceAssistant`

**File**: `src/hooks/useVoiceAssistant.ts`

**Purpose**: Main hook orchestrating voice conversation

**State Management**:
- `conversationState`: Messages, collected data, turn number
- `status`: Current voice status (idle/listening/processing/speaking/generating)
- `error`: Error messages
- `callEnded`: Whether call is complete
- `generatedPlan`: Generated plan data

**Core Functions**:

#### `startConversation()`
- Initializes conversation
- Calls `/api/chat` with turnNumber: 1
- Speaks first question
- Sets up conversation state

#### `processMessage(userMessage: string)`
- Processes user's spoken message
- Adds to conversation history
- Calls `/api/chat` for next question
- Handles completion (triggers plan generation)
- Manages turn-taking

#### `toggleListening()`
- Starts/stops speech recognition
- Handles state transitions
- Prevents conflicts (e.g., can't listen while AI speaks)

#### `endCall()`
- Stops all voice activities
- Sets callEnded flag
- Cleans up state

#### `extractDataAndGeneratePlan(messages)`
- Calls `/api/extract-data` to extract health data
- Calls `/api/generate-plan` to create plan
- Handles success/error
- Redirects to profile page

**Auto-Listening Logic**:
- After AI finishes speaking → auto-starts listening
- Uses `shouldAutoListen` flag
- Controlled by `useEffect` hook

**Guards**:
- `processingRef`: Prevents concurrent processing
- `hasStartedRef`: Prevents multiple starts
- `isConversationCompleteRef`: Prevents post-completion actions
- `callActiveRef`: Tracks call state

---

### `useSpeechRecognition`

**File**: `src/hooks/useSpeechRecognition.ts`

**Purpose**: Wraps Web Speech Recognition API

**Features**:
- Continuous recognition
- Interim results (real-time transcription)
- Final results (complete transcript)
- Speaking detection (when user is actively speaking)
- Error handling

**API**:
```typescript
{
  isListening: boolean,
  isSupported: boolean,
  startListening: () => void,
  stopListening: () => void,
  transcript: string,           // Final transcript
  interimTranscript: string,    // Live transcript
  isSpeaking: boolean          // User actively speaking
}
```

**Events Handled**:
- `onresult`: Processes recognition results
- `onspeechstart`: User starts speaking
- `onspeechend`: User stops speaking
- `onend`: Recognition ends
- `onerror`: Error handling

**Speaking Detection**:
- Sets `isSpeaking` when interim results arrive
- Clears after 1s timeout (if no new results)
- Used for visual feedback

---

### `useSpeechSynthesis`

**File**: `src/hooks/useSpeechSynthesis.ts`

**Purpose**: Wraps Web Speech Synthesis API

**Features**:
- Text-to-speech conversion
- Voice selection (prefers natural voices)
- Rate and pitch control
- Promise-based async speaking
- Cancellation support

**API**:
```typescript
{
  speak: (text: string) => void,              // Fire and forget
  speakAsync: (text: string) => Promise<void>, // Wait for completion
  stop: () => void,
  isSpeaking: boolean,
  isSupported: boolean,
  voices: SpeechSynthesisVoice[]
}
```

**Voice Selection**:
1. Preferred voice (if specified)
2. Google/Natural voices (English)
3. Any English voice
4. Default voice

**Promise Management**:
- Tracks pending promises by unique ID
- Resolves only when speech completes
- Handles cancellation gracefully

**Events**:
- `onstart`: Speech begins
- `onend`: Speech completes
- `onerror`: Error handling

---

## Data Flow

### Voice Conversation Flow

```
1. User clicks "Start Call"
   ↓
2. startConversation() called
   ↓
3. POST /api/chat (turnNumber: 1)
   ↓
4. Receive first question
   ↓
5. speak(question) → AI speaks
   ↓
6. Auto-start listening (after speech ends)
   ↓
7. User speaks → processMessage()
   ↓
8. POST /api/chat (turnNumber: 2)
   ↓
9. Receive next question → speak()
   ↓
10. Repeat steps 6-9 until turnNumber > 3
    ↓
11. Conversation complete → extractDataAndGeneratePlan()
    ↓
12. POST /api/extract-data
    ↓
13. POST /api/generate-plan
    ↓
14. Plan saved to Convex
    ↓
15. Redirect to /profile
```

### Plan Generation Flow

```
1. User completes conversation
   ↓
2. Extract health data from conversation
   ↓
3. Normalize data (fill defaults)
   ↓
4. Calculate daily calories (BMR + activity + goal)
   ↓
5. Generate workout plan:
   - Try AI (Gemini)
   - Fallback to pre-generated if fails
   ↓
6. Generate diet plan:
   - Try AI (Gemini)
   - Fallback to pre-generated if fails
   ↓
7. Normalize plans (ensure types correct)
   ↓
8. Save to Convex:
   - Deactivate old plans
   - Create new plan
   - Set as active
   ↓
9. Return plan data to frontend
```

### Authentication Flow

```
1. User signs up/signs in via Clerk
   ↓
2. Clerk webhook → /convex/http.ts
   ↓
3. Verify webhook signature (Svix)
   ↓
4. Sync user to Convex (users.syncUser)
   ↓
5. User data stored in Convex
   ↓
6. Frontend uses Clerk session
   ↓
7. Convex queries use Clerk auth context
```

---

## Configuration Files

### `package.json`

**Key Dependencies**:
- `next`: 15.5.9 (React framework)
- `react`: 18.3.1 (UI library)
- `@clerk/nextjs`: 6.14.3 (Authentication)
- `convex`: 1.23.0 (Backend)
- `@google/generative-ai`: 0.24.1 (AI)
- `@radix-ui/*`: UI components
- `lucide-react`: Icons
- `tailwindcss`: 4 (Styling)

**Scripts**:
- `dev`: Development server (Turbopack)
- `build`: Production build
- `start`: Production server
- `lint`: Linting

---

### `tailwind.config.ts`

**Theme Extensions**:
- **Colors**: Custom silver/chrome palette
- **Shadows**: Silver glow effects
- **Backgrounds**: Gradient patterns
- **Border Radius**: Custom radius values

**Custom Colors**:
- `silver`: 50-950 shades
- `platinum`: Light/default/dark
- `chrome`: Light/default/dark
- `steel`: Light/default/dark

**Custom Classes** (via CSS):
- `glow-silver-sm/md/lg`
- `card-chrome`
- `btn-silver-primary`
- `glass-silver`

---

### `next.config.ts`

**Configuration**:
```typescript
{
  eslint: {
    ignoreDuringBuilds: true  // Skip linting during build
  }
}
```

**Note**: ESLint errors don't block builds (for faster iteration)

---

### `src/middleware.ts`

**Purpose**: Protects routes with Clerk authentication

**Protected Routes**:
- `/generate-program`
- `/profile`

**Process**:
1. Checks if route matches protected pattern
2. Calls `auth.protect()` if protected
3. Redirects to sign-in if not authenticated

**Matcher**: Excludes static files, includes API routes

---

## Voice Assistant System

### Architecture

The voice assistant uses a **deterministic question flow** combined with **AI-powered data extraction**:

1. **Questions**: Hard-coded, predictable (3 questions)
2. **Data Extraction**: AI-powered (Gemini extracts structured data)
3. **Plan Generation**: AI-powered (Gemini generates plans)

### Question Flow

**Question 1** (Turn 1):
> "Hi {name}, I'm your personal AI fitness assistant. Welcome! I'll ask you a few questions to understand your profile and create a personalized fitness plan. Let's start with your age, gender, height, and weight."

**Question 2** (Turn 2):
> "Alright {name}, now tell me your fitness goal, activity level, experience, preferred workout location (home or gym), and how many days per week you can train."

**Question 3** (Turn 3):
> "Great {name}. Final question: do you have any dietary preferences, health conditions, or injuries?"

**Completion** (Turn 4+):
> "Great! I have all the required details. Your personalized fitness plan is being generated—please wait, you'll be redirected shortly."

### State Machine

```
IDLE
  ↓ (startConversation)
PROCESSING
  ↓ (receive question)
SPEAKING
  ↓ (speech ends)
LISTENING
  ↓ (user speaks)
PROCESSING
  ↓ (repeat until complete)
GENERATING
  ↓ (plan created)
COMPLETE
```

### Error Handling

**Speech Recognition Errors**:
- `no-speech`: Ignored (user didn't speak)
- `aborted`: Ignored (intentional stop)
- `not-allowed`: Shows error (permission denied)
- `network`: Shows error (connection issue)
- `audio-capture`: Shows error (no microphone)

**AI Errors**:
- Timeout: Falls back to pre-generated plan
- Parse error: Falls back to pre-generated plan
- API error: Falls back to pre-generated plan
- Always returns a plan (never fails completely)

---

## AI Integration

### Google Gemini AI

**Models Used**:
- **Primary**: `gemini-2.5-flash` (fast, cost-effective)
- **Fallback**: `gemini-2.0-flash` (backup)
- **Alternative**: `gemini-2.5-pro` (in gemini.ts, not used in routes)

**API Key**: `GOOGLE_GENERATIVE_AI_API_KEY` (environment variable)

### Prompts

#### Data Extraction Prompt
**File**: `src/lib/prompts.ts` → `DATA_EXTRACTION_PROMPT`

**Purpose**: Extracts structured health data from conversation

**Format**:
```
Extract fitness data from this conversation.

Conversation:
{conversation}

Return ONLY valid JSON:
{
  "name": string | null,
  "age": number | null,
  ...
}
```

**Rules**:
- Numbers must be numbers
- Use null if missing
- No text outside JSON

#### Workout Plan Prompt
**File**: `src/lib/prompts.ts` → `createWorkoutPrompt()`

**Purpose**: Generates workout plan

**Format**:
```
Create a SIMPLE workout plan.

User:
- Goal: {goal}
- Experience: {experienceLevel}
- Location: {workoutPreference}
- Days per week: {daysPerWeek}
- Health conditions: {healthConditions}

Return ONLY JSON:
{
  "schedule": ["Monday", "Wednesday", "Friday"],
  "exercises": [...]
}
```

**Rules**:
- Use specified days only
- 3-5 exercises per day
- Sets/reps must be numbers
- Descriptions under 8 words
- No markdown

#### Diet Plan Prompt
**File**: `src/lib/prompts.ts` → `createDietPrompt()`

**Purpose**: Generates diet plan

**Format**:
```
Create a SIMPLE daily meal plan.

Daily calories: {dailyCalories}
Dietary restrictions: {dietaryRestrictions}

Return ONLY JSON:
{
  "dailyCalories": {dailyCalories},
  "meals": [...]
}
```

**Rules**:
- 4-5 meals total
- Common, simple foods
- Respect dietary restrictions
- No explanations

### Response Parsing

**Challenge**: Gemini may return markdown or extra text

**Solution**: Regex extraction
```typescript
const json = text.match(/\{[\s\S]*\}/)?.[0];
```

**Fallback**: If JSON not found → use pre-generated plan

---

## Authentication & Authorization

### Clerk Integration

**Provider**: `ConvexClerkProvider`
- Wraps app with Clerk + Convex providers
- Enables authenticated Convex queries

**Middleware**: `src/middleware.ts`
- Protects routes: `/generate-program`, `/profile`
- Redirects unauthenticated users

**Webhook**: `convex/http.ts`
- Syncs user data from Clerk to Convex
- Handles `user.created` and `user.updated` events

### Environment Variables

**Required**:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key
- `CLERK_SECRET_KEY`: Clerk secret (server-side)
- `CLERK_WEBHOOK_SECRET`: Webhook verification secret
- `NEXT_PUBLIC_CONVEX_URL`: Convex deployment URL
- `GOOGLE_GENERATIVE_AI_API_KEY`: Gemini API key

---

## Database Schema

### Users Table

```typescript
{
  _id: Id<"users">,
  name: string,
  email: string,
  image?: string,
  clerkId: string
}
```

**Index**: `by_clerk_id` on `clerkId`

**Purpose**: Stores user profile data synced from Clerk

---

### Plans Table

```typescript
{
  _id: Id<"plans">,
  userId: string,              // Clerk user ID
  name: string,                 // Plan name (e.g., "Weight Loss Plan")
  workoutPlan: {
    schedule: string[],         // ["Monday", "Wednesday", "Friday"]
    exercises: Array<{
      day: string,              // "Monday"
      routines: Array<{
        name: string,            // "Push-ups"
        sets?: number,          // 3
        reps?: number,          // 12
        duration?: string,     // "30 seconds"
        description?: string, // "Keep core tight"
        exercises?: string[]   // ["Push-up", "Plank"]
      }>
    }>
  },
  dietPlan: {
    dailyCalories: number,      // 2000
    meals: Array<{
      name: string,             // "Breakfast"
      foods: string[]           // ["Oatmeal", "Banana"]
    }>
  },
  isActive: boolean            // Only one active per user
}
```

**Indexes**:
- `by_user_id`: Query plans by user
- `by_active`: Query active plans

**Constraints**:
- Only one active plan per user (enforced in `createPlan`)

---

## Setup & Deployment

### Prerequisites

1. **Node.js**: 20+ (check `package.json` → `@types/node`)
2. **npm**: Latest version
3. **Clerk Account**: For authentication
4. **Convex Account**: For database
5. **Google AI API Key**: For Gemini

### Installation

```bash
# Clone repository
git clone <repo-url>
cd "Fyra-AI fitness assistant"

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Convex
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# Convex (for webhook)
CONVEX_DEPLOYMENT=prod
```

### Convex Setup

```bash
# Install Convex CLI
npm install -g convex

# Login to Convex
npx convex login

# Initialize Convex (if not done)
npx convex dev

# Deploy schema
npx convex deploy
```

### Clerk Setup

1. Create Clerk application
2. Get publishable key and secret key
3. Set up webhook:
   - URL: `https://your-convex-url.convex.site/clerk-webhook`
   - Events: `user.created`, `user.updated`
   - Get webhook secret

### Development

```bash
# Start development server
npm run dev

# In another terminal, start Convex
npx convex dev
```

**Access**:
- Frontend: http://localhost:3000
- Convex Dashboard: https://dashboard.convex.dev

### Production Build

```bash
# Build
npm run build

# Start production server
npm start
```

### Deployment

**Recommended Platforms**:
- **Frontend**: Vercel (optimized for Next.js)
- **Backend**: Convex (serverless, auto-scaling)

**Vercel Deployment**:
1. Connect GitHub repository
2. Add environment variables
3. Deploy

**Convex Deployment**:
- Automatic on `npx convex deploy`
- Or via CI/CD

---

## Key Algorithms

### Calorie Calculation

**Formula**: Mifflin-St Jeor Equation

```typescript
// BMR Calculation
const bmr = gender === "male"
  ? 10 * weight + 6.25 * height - 5 * age + 5
  : 10 * weight + 6.25 * height - 5 * age - 161;

// Activity Multiplier
const multipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
};

// Total Daily Energy Expenditure (TDEE)
let calories = bmr * multipliers[activityLevel];

// Goal Adjustments
if (goal === "lose_weight") calories -= 500;
if (goal === "build_muscle") calories += 300;
if (goal === "improve_fitness") calories += 100;
```

**Units**:
- Weight: kg
- Height: cm
- Age: years
- Calories: kcal/day

---

### Fallback Plan Matching

**Algorithm**: Progressive Matching

```typescript
// Level 1: Exact match
match = plans.find(p => 
  p.gender === user.gender &&
  p.goal === user.goal &&
  p.activity === user.activity &&
  p.weightRange === user.weightRange
);

// Level 2: Without weight
if (!match) {
  match = plans.find(p =>
    p.gender === user.gender &&
    p.goal === user.goal &&
    p.activity === user.activity
  );
}

// Level 3: Without activity
if (!match) {
  match = plans.find(p =>
    p.gender === user.gender &&
    p.goal === user.goal
  );
}

// Level 4: Gender only
if (!match) {
  match = plans.find(p => p.gender === user.gender);
}

// Level 5: Ultimate fallback
if (!match) {
  match = plans[0];
}
```

**Weight Range Mapping**:
- ≤65 kg → "50-65"
- ≤80 kg → "66-80"
- >80 kg → "81-95"

**Activity Mapping**:
- sedentary/light → "sedentary"
- moderate → "moderate"
- active/very_active → "active"

---

### Plan Normalization

**Purpose**: Ensure data types match Convex schema

**Workout Plan**:
```typescript
function normalizeWorkoutPlan(plan: WorkoutPlan): WorkoutPlan {
  return {
    ...plan,
    exercises: plan.exercises.map(exercise => ({
      ...exercise,
      routines: exercise.routines.map(routine => ({
        ...routine,
        sets: typeof routine.sets === "number" ? routine.sets : 0,
        reps: typeof routine.reps === "number" ? routine.reps : 0,
      }))
    }))
  };
}
```

**Diet Plan**:
```typescript
function normalizeDietPlan(plan: DietPlan, calculatedCalories: number): DietPlan {
  return {
    ...plan,
    dailyCalories: plan.dailyCalories || calculatedCalories,
    meals: plan.meals || []
  };
}
```

---

## Error Handling Strategy

### Graceful Degradation

**Principle**: Never fail completely

**Levels**:
1. **AI Generation**: Try primary model → fallback model → pre-generated plan
2. **Data Extraction**: Try extraction → use defaults
3. **Plan Saving**: Try save → log error → return plan anyway

### Error Types

**Recoverable**:
- AI timeout → use fallback
- JSON parse error → use fallback
- Missing API key → use fallback

**Non-Recoverable**:
- Authentication failure → redirect to sign-in
- Database connection → show error message
- Browser not supported → show warning

---

## Performance Optimizations

### Frontend
- **Code Splitting**: Next.js automatic
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Next.js font optimization
- **Lazy Loading**: Components loaded on demand

### Backend
- **Convex**: Serverless, auto-scaling
- **Caching**: Convex query caching
- **Indexes**: Database indexes for fast queries

### AI
- **Model Selection**: Fast models (Flash) for speed
- **Timeout**: 30s timeout prevents hanging
- **Fallback**: Pre-generated plans avoid delays

---

## Security Considerations

### Authentication
- **Clerk**: Industry-standard auth
- **Webhook Verification**: Svix signature verification
- **Route Protection**: Middleware guards

### Data Validation
- **Convex Schema**: Type-safe validation
- **API Validation**: Request body validation
- **Default Values**: Prevents null errors

### API Keys
- **Environment Variables**: Never committed
- **Server-Side Only**: API keys not exposed to client
- **Webhook Secrets**: Verified signatures

---

## Future Enhancements

### Potential Features
1. **Plan Editing**: Allow users to modify plans
2. **Progress Tracking**: Log workouts, track progress
3. **Social Features**: Share plans, community
4. **Mobile App**: React Native version
5. **More AI Models**: Support multiple AI providers
6. **Voice Cloning**: Custom AI voice
7. **Multi-language**: Support more languages
8. **Plan Templates**: Pre-made plan templates
9. **Nutrition Database**: Detailed food database
10. **Workout Videos**: Exercise demonstration videos

### Technical Improvements
1. **Caching**: Cache AI responses
2. **Rate Limiting**: Prevent abuse
3. **Analytics**: User behavior tracking
4. **A/B Testing**: Test different prompts
5. **Monitoring**: Error tracking (Sentry)
6. **Testing**: Unit + integration tests
7. **Documentation**: API documentation
8. **CI/CD**: Automated deployment

---

## Troubleshooting

### Common Issues

**1. Speech Recognition Not Working**
- **Cause**: Browser not supported
- **Solution**: Use Chrome, Edge, or Safari
- **Check**: `isSupported` flag

**2. AI Plan Generation Failing**
- **Cause**: API key missing or invalid
- **Solution**: Check `GOOGLE_GENERATIVE_AI_API_KEY`
- **Fallback**: Pre-generated plans should work

**3. Authentication Issues**
- **Cause**: Clerk keys incorrect
- **Solution**: Verify environment variables
- **Check**: Clerk dashboard

**4. Convex Queries Failing**
- **Cause**: Convex URL incorrect
- **Solution**: Check `NEXT_PUBLIC_CONVEX_URL`
- **Check**: Convex dashboard

**5. Webhook Not Syncing Users**
- **Cause**: Webhook secret incorrect
- **Solution**: Verify `CLERK_WEBHOOK_SECRET`
- **Check**: Clerk webhook logs

---

## Conclusion

**Fyra AI** is a comprehensive fitness assistant application that combines:
- **Modern web technologies** (Next.js, React, TypeScript)
- **AI-powered personalization** (Google Gemini)
- **Voice interaction** (Web Speech APIs)
- **Robust backend** (Convex serverless)
- **Secure authentication** (Clerk)

The system is designed for **reliability** (fallback plans), **performance** (fast models, caching), and **user experience** (voice interaction, real-time feedback).

This documentation covers every aspect of the codebase, from high-level architecture to low-level implementation details. Use it as a reference for development, debugging, and onboarding new team members.

---

**Last Updated**: 2024
**Version**: 0.1.0
**License**: Private


