export default function PageWrapper({ children }) {
  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 custom-scrollbar">
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </main>
  );
}