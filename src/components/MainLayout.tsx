export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-bold">Stitch UI Layout</h1>
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
          {/* Main Content Area */}
          <p>Content goes here...</p>
        </div>
      </main>
      <footer className="bg-white p-4 border-t flex justify-between">
        <button type="button" className="px-4 py-2 border rounded">
          Back
        </button>
        <button type="button" disabled className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
          Next
        </button>
      </footer>
    </div>
  );
}
