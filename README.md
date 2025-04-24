# Resume Role Analyzer

A web application that analyzes resumes and categorizes them based on job roles, skills, and experience.

## Features

- Upload and analyze resumes (PDF, DOC, DOCX)
- AI-powered role categorization
- Skills and experience analysis
- Confidence scoring
- Industry and seniority level detection

## Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- OpenAI API
- Supabase

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- OpenAI API key
- Supabase account

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd role-resume-sorter

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

### Configuration

1. Create a `.env` file in the root directory
2. Add your OpenAI API key:

   ```
   VITE_OPENAI_API_KEY=your_api_key_here
   ```

3. Configure your Supabase credentials in `src/integrations/supabase/client.ts`

## Development

The project uses:

- Vite for fast development and building
- TypeScript for type safety
- React for the UI
- shadcn-ui for components
- Tailwind CSS for styling

## Deployment

1. Build the project:

   ```sh
   npm run build
   ```

2. Deploy the contents of the `dist` directory to your hosting provider

## License

MIT License
