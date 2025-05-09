export default function TestPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Página de Prueba</h1>
      <p>Esta es una página de prueba para verificar que las rutas funcionan correctamente.</p>

      <div className="mt-4">
        <a href="/directorio" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-4">
          Ir a Directorio
        </a>

        <a href="/dashboard" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Ir a Dashboard
        </a>
      </div>
    </div>
  )
}

