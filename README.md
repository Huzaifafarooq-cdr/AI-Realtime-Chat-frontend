# AI Real Chat - Frontend

Frontend application for AI Real Chat built with Next.js, React, TypeScript, and Tailwind CSS.

## Live URL
https://ai-realtime-chat-frontend.vercel.app

---

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Socket.IO Client
- Razorpay Checkout
- Google OAuth Redirect Flow

---

## Features

- Google Login Authentication
- Real-time Chat UI
- Instant Message Updates
- AI Reply Suggestions
- Premium Upgrade Flow
- Responsive Design
- User Profile Display

---

## State Management

This project uses **Prop Drilling** because the application is small and lightweight.

For larger-scale applications with complex shared state, we would use:

- Redux Toolkit
- Context API
- Zustand

Prop drilling was chosen here to keep the code simple, clean, and easy to maintain for this assignment.

---

## Project Structure

```bash
src/
components/
app/
lib/
public/

```

## Environment Variables

Create a .env.local file:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
NEXT_PUBLIC_GOOGLE_AUTH_URL=https://your-backend-url.onrender.com/auth/google
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_here
```

## Installation
```bash
npm install
```

## Run Development Server
```bash
npm run dev
```
## Application runs on:
```bash
http://localhost:3000
```
## Production Build
```bash
npm run build
```
```bash
npm start
```
Main Pages
Login Page
Google OAuth Sign In
Clean responsive UI
Chat Page
Real-time Messaging
Sidebar Users & Chats
AI Suggestion Button
Premium Badge
Scrollable Chat Area
Header

Displays logged-in user:

Name
Email
Avatar
Real-Time Features

Socket.IO is used for:

Sending messages
Receiving messages
AI suggestions
Premium updates after payment
Payment Flow

Free users can upgrade to Premium using Razorpay:

Create Order
Open Checkout
Payment Success
Premium Activated Instantly
Future Improvements
Redux Toolkit
Group Chat
Notifications
Typing Indicator
File Sharing
Dark Mode
