const PageHeader = ({ title, description, children }) => {
  return (
    <div className="flex sm:items-center justify-between p-4 border-b sm:flex-row flex-col gap-4 mb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 self-end">{children}</div>
      )}
    </div>
  );
};

export default PageHeader;
