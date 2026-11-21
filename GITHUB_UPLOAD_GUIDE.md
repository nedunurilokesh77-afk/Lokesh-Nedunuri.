# Upload this portfolio to GitHub — Windows step by step

## 1. Extract the ZIP

Extract `lokesh-nedunuri-portfolio.zip` to a normal folder, for example:

`C:\Users\YOUR-NAME\Documents\lokesh-nedunuri-portfolio`

Open that folder in VS Code.

## 2. Install and test locally

Open **Terminal → New Terminal** in VS Code and run:

```powershell
node -v
npm -v
npm install
Copy-Item .env.example .env
```

Open `.env` and set:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
```

Then run:

```powershell
npx prisma generate
npx prisma db push
npm run dev
```

Open `http://localhost:3000`. Check the hero, scroll animations, videos, projects, About page (`/about`) and contact form.

Before deploying, run:

```powershell
npm run typecheck
npm run lint
npm run build
```

## 3. Create a GitHub repository

1. Sign in at https://github.com.
2. Click **New repository**.
3. Repository name: `lokesh-nedunuri-portfolio`.
4. Choose Public if you want recruiters and search engines to discover the source code.
5. Do not select **Add a README**, **.gitignore** or **license** — this project already contains them.
6. Click **Create repository**.

## 4. Push your project

Copy the HTTPS repository URL shown by GitHub. In the VS Code terminal, from the project root, run:

```powershell
git init
git add .
git status
git commit -m "Build Lokesh Nedunuri portfolio and SEO foundation"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/lokesh-nedunuri-portfolio.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your real GitHub username. If GitHub asks you to authenticate, complete the browser sign-in.

For future changes:

```powershell
git add .
git commit -m "Update portfolio"
git push
```

## 5. Deploy the website

Recommended: Vercel, because this is a Next.js application with server routes.

1. Visit https://vercel.com and sign in with GitHub.
2. Select **Add New → Project**.
3. Import `lokesh-nedunuri-portfolio`.
4. Keep the detected Next.js settings and `npm run build` build command.
5. Add environment variables. Set `NEXT_PUBLIC_SITE_URL` to the actual production domain (for example `https://your-real-domain.com`, with no trailing slash).
6. Configure a persistent production database before enabling the contact form. The included SQLite database is for local development only; serverless local files are not durable.
7. Deploy.

## 6. Help Google discover your name

1. Choose and connect a personal domain that clearly represents your name, if available.
2. In Vercel, add the domain and follow its DNS instructions.
3. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain and redeploy.
4. Open Google Search Console: https://search.google.com/search-console.
5. Add a **Domain property** and verify it with the DNS TXT record Google provides.
6. Submit `https://YOUR-DOMAIN/sitemap.xml` under **Sitemaps**.
7. Use **URL Inspection** for the homepage and `/about`, then request indexing.
8. Add the same official website link to your real GitHub, LinkedIn and other genuine public profiles. Use the same display name, Lokesh Nedunuri, consistently.
9. Ask legitimate project, hackathon or university pages to link to your profile when they mention your work. Do not buy spam backlinks or create fake profiles.

Google controls indexing and ranking; this setup improves discoverability but cannot guarantee a first-place ranking or a specific indexing date.

## 7. Before making the repository public

- Update `src/data/portfolio.ts` with your real email, GitHub and LinkedIn URLs.
- Verify every project description and technology list.
- Replace illustrative project visuals with actual screenshots when you have them.
- Add your real portrait only if you want one displayed.
- Never commit `.env`, `.env.local`, API keys, passwords, database files or private keys. `.gitignore` already excludes these.
