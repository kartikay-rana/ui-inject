import Link from 'next/link';

export default function GetStarted() {
  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      <div style={{ fontSize: '0.85rem', marginBottom: '1.2rem' }}>
        <Link href="/" style={{ opacity: 0.6 }}>
          ← Back
        </Link>
      </div>
      <h1 style={{ fontSize: '2rem', marginTop: 0 }}>Get Started</h1>
      <p style={{ opacity: 0.75 }}>
        Each component installs as plain React + TypeScript + CSS files into your project. You own the code — nothing runs
        from the catalogue at runtime.
      </p>

      <h2 className="step">1. Install the CLI</h2>
      <pre className="block">{`npx ui-injector@latest --help`}</pre>

      <h2 className="step">2. Add a component</h2>
      <pre className="block">{`npx ui-injector@latest add button
npx ui-injector@latest add sidebar`}</pre>

      <h2 className="step">3. Premium access</h2>
      <p style={{ opacity: 0.75 }}>
        Log in on any premium component page (try <Link href="/components/sidebar">sidebar</Link>) and copy the token, or set
        it in your environment:
      </p>
      <pre className="block">{`TECH_INJECT_TOKEN=... npx ui-injector@latest add sidebar`}</pre>

      <h2 className="step">4. Theme</h2>
      <p style={{ opacity: 0.75 }}>Every install writes the design tokens into your project — no separate theme package needed. Import it once:</p>
      <pre className="block">{`import './src/components/theme.css';
// in your Vite entry (main.tsx) or Next.js root layout`}</pre>
    </main>
  );
}