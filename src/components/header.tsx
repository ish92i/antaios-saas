type HeaderProps = {
  title?: string;
  description?: string;
};

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="z-10 flex w-full flex-col border-b border-border bg-card px-6">
      <div
        className={`mx-auto flex w-full max-w-screen-xl items-center justify-between ${
          description ? "py-4" : "py-3"
        }`}
      >
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-3xl font-medium text-primary/80">{title}</h1>
          {description ? (
            <p className="text-base font-normal text-primary/60">{description}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
