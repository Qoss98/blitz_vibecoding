# ⚡ React + Vite Boilerplate for Cursor

A modern React boilerplate project designed to help you quickly start building cool stuff with React using Cursor. This template includes Vite, TypeScript, TailwindCSS, React Query, and follows clean architecture best practices.


## Inhoudsopgave

- [What is Cursor?](#what-is-cursor)
- [Getting Started](#getting-started)
  - [Step 1: Install Cursor](#step-1-install-cursor)
  - [Step 2: Install Git from Cursor](#step-2-install-git-from-cursor)
  - [Step 3: Clone This Project](#step-3-clone-this-project)
  - [Step 4: Install Node.js](#step-4-install-nodejs)
  - [Step 5: Install Dependencies](#step-5-install-dependencies)
  - [Step 6: Connect to Database (Optional)](#step-6-connect-to-database-optional)
  - [Step 7: Start Development](#step-7-start-development)
- [Working Effectively with Cursor](#working-effectively-with-cursor)
- [Setting Up Supabase MCP](#setting-up-supabase-mcp)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Available Scripts](#available-scripts)
- [Start!](#building-cool-stuff)

## What is Cursor?

Cursor is an AI-powered code editor that helps you write code faster and more efficiently. It's built on VS Code and enhanced with AI capabilities to understand your codebase and help you build applications.

## Getting Started

### Step 1: Install Cursor

1. Visit [cursor.sh](https://cursor.sh) and click **"Download"**
2. Download Cursor for your operating system (macOS, Windows, or Linux)
3. Install Cursor following the installation instructions for your platform
4. Open Cursor after installation

### Step 2: Install Git from Cursor

If you don't have Git installed on your computer:

1. In Cursor, look at the **top left** of the window
2. Click on the **Git** menu
3. Cursor will detect if Git is missing and guide you to install it
4. Follow the on-screen instructions:
   - Click **Next** through the installation steps
   - Complete the installation on your computer
   - Restart Cursor if prompted

### Step 3: Clone This Project

1. In Cursor, click on **Git** in the top left menu
2. Select **"Clone from Repository"** (or "Clone Repository")
3. Paste the repository URL when prompted
4. Choose a folder to clone the project into
5. Cursor will automatically clone the repository and prompt you to open it
6. Click **"Open"** to start working

### Step 4: Install Node.js

This project requires Node.js to run. If you don't have Node.js installed:

1. Visit [nodejs.org/en/download](https://nodejs.org/en/download)
2. Download the **LTS (Long Term Support)** version for your operating system
3. Run the installer and follow the installation wizard:
   - Click **Next** through the installation steps
   - Accept the license agreement
   - Complete the installation
4. Verify the installation by opening a terminal and running:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers displayed.

> **Note:** The Node.js installer includes npm (Node Package Manager), which is required to install project dependencies.

### Step 5: Install Dependencies

Open the integrated terminal in Cursor (`Ctrl+`` ` on Windows/Linux or `Cmd+`` ` on macOS) and run:

```bash
npm install
```

> **Note:** All npm commands work identically on Windows, macOS, and Linux. This project is fully cross-platform compatible.

### Step 6: Connect to Database (Optional)

This project works with or without a database:

**Option 1: Use the Shared Database (Easiest)**

Copy the example environment file:

```bash
cp .env.example .env
```

The `.env.example` file already contains pre-configured database credentials. Your app will automatically connect to the shared Supabase database.

**Option 2: Use Your Own Database**

If you want to use your own Supabase project, follow the instructions in [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

**Option 3: Work Without Database**

The app will automatically fall back to localStorage if no database is configured. You can skip this step entirely!

### Step 7: Start Development

```bash
npm run dev
```

Your app will be available at `http://localhost:5173`

## Working Effectively with Cursor

To maximize your productivity and minimize token usage while working with Cursor, follow this workflow:

### 1. Start Your Development Server

**Before you begin coding**, make sure to start the development server so you can see your changes in real-time:

```bash
npm run dev
```

Your app will be available at `http://localhost:5173` - keep this open in your browser throughout development.

### 2. Open the Agent Chat

1. Look at the **right-hand side** of the Cursor window
2. Click the **Agent** button (∞ icon) to open the agent chat
3. This opens the AI assistant that can help you write and modify code

### 3. Use Detailed Prompts to Save Tokens

**Tip:** Before starting your coding session, prepare a detailed prompt describing what you want to build. You can:
- Write it in advance using ChatGPT or another tool
- Include specific requirements, file structures, and technical details
- Copy the detailed prompt into Cursor's agent chat

This approach saves tokens because you're being clear upfront instead of going back and forth with clarifications.

### 4. Use "Ask" Mode for Questions

When you have questions or need quick information without code changes:
1. Click the **Agent** dropdown button on the right side
2. Select **"Ask"** mode from the dropdown menu
3. This mode is optimized for questions and saves tokens compared to full agent mode

Use "Ask" mode for:
- Understanding how code works
- Getting explanations
- Quick clarifications
- Debugging help

### 5. Commit Your Changes Regularly

After you've added functionality and tested it:

1. Press `/` to open the command palette
2. Type "git commit" and select the **git-commit** command
3. This will stage and commit your changes with a helpful commit message

**Why commit regularly?** This creates checkpoints you can revert to if something goes wrong. It's like saving your progress in a game!

### 6. Start Fresh for Each Feature

When you're satisfied with a feature:
1. Close the current agent chat
2. Start a new chat for your next feature

**Why?** This keeps token usage limited and prevents chat history from becoming too long, which can slow down responses and increase costs.

### Development Workflow Summary

1. ✅ Run `npm run dev` to start the server
2. ✅ Open Agent chat (∞ button on right)
3. ✅ Use detailed prompts (prepared in advance)
4. ✅ Build and test your feature
5. ✅ Commit changes using `/` → "git commit"
6. ✅ Close chat and start fresh for next feature
7. ✅ Repeat!

## Setting Up Supabase MCP

The Supabase MCP (Model Context Protocol) server allows Cursor's AI to interact directly with your Supabase projects, making it easier to manage databases, migrations, and edge functions.

### Step 0: Create a Supabase account (its free)

### Step 1: Get Your Supabase Access Token

1. Visit [supabase.com](https://supabase.com) and sign in to your account
2. Go to your account settings (click your profile icon → **Account Preferences**)
3. Navigate to **Access Tokens** in the left sidebar
4. Give your token a descriptive name (e.g., "Cursor MCP")
5. Click **Generate New Token**
6. Copy the generated token (it starts with `sbp_`)
7. **Important:** Save this token securely - you won't be able to see it again!

### Step 2: Configure MCP in Cursor

You can configure the Supabase MCP server using Cursor's built-in UI:

1. Open Cursor Settings:
   - **macOS:** `Cmd + ,` or go to **Cursor** → **Settings**
   - **Windows/Linux:** `Ctrl + ,` or go to **File** → **Preferences** → **Settings**

2. Navigate to **Tools** → **MCP** in the settings sidebar

3. Click **New MCP Server** button

4. Fill in the configuration:
  ```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "sbp_your_token_here"
      ]
    }
  }
}
```
(replace with your actual token from Step 1)

5. Save the configuration and restart Cursor

**Alternative: Manual Configuration**

If you prefer to edit the configuration file directly:

1. Open your Cursor MCP configuration file:
   - **macOS/Linux:** `~/.cursor/mcp.json`
   - **Windows:** `%APPDATA%\Cursor\mcp.json`

2. Add the Supabase MCP server configuration to the `mcpServers` object. Your `mcp.json` file should look like this (the `supabase` entry can be added alongside other MCP servers):


**Important:** If you already have other MCP servers configured, add the `supabase` entry inside the existing `mcpServers` object. Make sure to include a comma after the closing brace if there are other servers, or remove the comma if it's the last entry.

Example with other servers already configured:

```json
{
  "mcpServers": {
    "browser-tools": {
      "command": "npx",
      "args": ["@browsermcp/mcp@latest"]
    },
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "sbp_your_token_here"
      ]
    }
  }
}
```

3. Replace `sbp_your_token_here` with the access token you copied in Step 1

4. Save the file and restart Cursor

### Step 3: Verify the Setup

After restarting Cursor:
1. Open the Agent chat
2. Try asking the AI: "List my Supabase projects"
3. If everything is configured correctly, the AI should be able to interact with your Supabase account

### Troubleshooting

- **Token not found:** Make sure you copied the entire token including the `sbp_` prefix
- **Connection issues:** Verify your internet connection and that Supabase services are accessible
- **MCP not loading:** Check that the `mcp.json` file has valid JSON syntax

## Project Structure

This boilerplate follows clean architecture principles:

- **`src/dal/`** - Data Access Layer (pure functions for HTTP requests)
- **`src/features/*/api/`** - React Query hooks for data fetching
- **`src/features/*/components/`** - Presentational components
- **`src/features/*/containers/`** - Container components for data orchestration
- **`src/components/`** - Shared reusable UI components
- **`src/lib/http/`** - Centralized HTTP client configuration

## Tech Stack

- **React 19** - Latest stable version of React
- **TypeScript 5** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Query** - Server state management
- **ESLint** - Code linting with TypeScript support

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Building Cool Stuff

Now that you're set up with Cursor and this boilerplate, you're ready to start building! The project structure is set up to help you organize your code cleanly and efficiently. Use Cursor's AI features to help you write components, create API integrations, and build amazing React applications.

Happy coding! 🚀
