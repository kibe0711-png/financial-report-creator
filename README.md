# Financial Report Creator

A cloud-based automated financial report generator built with Next.js that transforms trial balance data into professional financial statements.

## Features

- **CSV Upload & Parsing**: Import trial balance data with automatic column mapping
- **Smart Classification**: Auto-classify accounts to Balance Sheet or Income Statement
- **Manual Entry**: Add or edit entries directly in the app
- **Report Generation**:
  - Balance Sheet (Statement of Financial Position)
  - Income Statement (P&L)
- **Export Options**: Download reports as PDF or Excel

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Exports**: @react-pdf/renderer (PDF), ExcelJS (Excel)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon, Supabase, Vercel Postgres, etc.)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kibe0711-png/financial-report-creator.git
cd financial-report-creator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your PostgreSQL connection string:
```
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kibe0711-png/financial-report-creator)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variable:
   - `DATABASE_URL`: Your PostgreSQL connection string
4. Deploy!

### Database Options

**Recommended: Neon** (Free tier available)
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to Vercel environment variables

**Alternative: Vercel Postgres**
1. In Vercel project settings
2. Go to Storage tab
3. Create Postgres database
4. Connection string auto-added

## Usage

### 1. Create a Project
- Click "New Project"
- Enter company name and period end date

### 2. Upload Trial Balance
- Upload CSV file with trial balance data
- Map columns (Account Code, Account Name, Amount, etc.)
- Preview and import

### 3. Classify Accounts
- Review auto-classifications
- Manually adjust classifications as needed
- Save changes

### 4. Generate Reports
- View Balance Sheet and Income Statement
- Export as PDF or Excel

## Project Structure

```
financial-report-creator/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── projects/          # Project pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/                   # Utility functions
│   ├── csv-parser.ts     # CSV parsing logic
│   ├── classifier.ts     # Account classification
│   ├── report-generator.ts
│   └── ...
├── prisma/               # Database schema
└── types/                # TypeScript types
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
