'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/dashboard')
    }, 2100)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <>
      <style>{`
        @keyframes fadeInBounce {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          50% {
            opacity: 1;
            transform: translateY(10px);
          }
          70% {
            transform: translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInBounce {
          animation: fadeInBounce 1.5s ease forwards;
        }

        @keyframes wink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .wink-eye {
          animation: wink 2s infinite;
          transform-origin: center;
        }
      `}</style>

      <main
        className="flex items-center justify-center bg-gray-50 px-4"
        style={{
          height: '100dvh',
        }}
      >
        <div className="text-center bg-white p-6 rounded shadow-md w-full max-w-md animate-fadeInBounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4 text-black"
            aria-hidden="true"
            role="img"
          >
            <circle cx="32" cy="32" r="30" />
            <circle cx="22" cy="26" r="4" fill="currentColor" />
            <path className="wink-eye" d="M42 26h8" />
            <path d="M20 42c6 8 18 8 24 0" />
          </svg>

          <h1 className="text-xl md:text-2xl font-bold mb-2 text-red-600">
            Usuario no autorizado ¡Nos vemos!
          </h1>
          <p className="text-base md:text-lg text-gray-700">
            Regresando al menú principal...
          </p>
        </div>
      </main>
    </>
  )
}
