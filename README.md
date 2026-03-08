# Quiz Application

A full-stack quiz application where users can take quizzes and administrators can manage quiz questions and view user results.
The system supports user authentication, result tracking, and quiz management through an admin panel.

This project was built as part of my software developer portfolio.

## Features
User Features

Take a quiz with 10 questions per attempt

Navigate questions using Next and Previous buttons

Change answers before submitting

View final quiz results

If the user passes, they can save their result

If the user fails, they can retry the quiz

Option to take quiz as a guest user

Option to sign up / sign in for a personal account

Responsive interface for different screen sizes

Admin Features

Administrators have their own authentication system.

Admin capabilities include:

Admin Sign Up

Admin Sign In

Add quiz questions

Delete quiz questions

Manage quiz question limit (10 questions per quiz)

View user quiz results

Each user result includes:

Username

Date

Time

Score

Pass / Fail status

## Tech Stack
Frontend

HTML5

JavaScript

SASS

Responsive UI

Backend

Node.js

Express.js

Database

MongoDB

Libraries & Tools

**Development Tools:**

Git

GitHub

Visual Studio Code

Libraries Used:

validator

sweetalert

mailgun

Testing & Code Quality:

ESLint

Jest

Authentication

**The application includes two authentication systems:**

- User Authentication

- Sign up

- Sign in

- Password Reset 

- Guest access for quiz attempts

- Admin Authentication

- Admin sign up

- Admin sign in

- Access to admin dashboard for managing quizzes


The quiz system includes:

- Maximum of 10 questions per quiz

- Next / Previous navigation

- Answer selection and editing

- Automatic score calculation

- Pass / Fail evaluation

- Option to save results

- Result Storage

Quiz results are stored in MongoDB and include:

  - Username
   
  - Date
   
  - Time
   
  - Score
   
  - Pass / Fail status

Tools Used:

Version Control:

   - Git
    
   - GitHub

Development Environment:
    
   - Visual Studio Code

Testing:

  - Jest

- Code Quality:

  - ESLint
