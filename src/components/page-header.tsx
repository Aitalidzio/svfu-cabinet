export function PageHeader({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {lead ? <p className="mt-2 max-w-2xl text-fg-muted">{lead}</p> : null}
    </header>
  );
}
