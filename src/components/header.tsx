type HeaderProps = {
  title?: string;
  description?: string;
};

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="z-10 flex w-full flex-col bg-secondary px-6">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-2">
        <div className="flex flex-col items-start gap-0.5">
          <h1 className="text-xl font-semibold text-primary/80">{title}</h1>
          {description ? (
            <p className="text-sm text-primary/60">{description}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
