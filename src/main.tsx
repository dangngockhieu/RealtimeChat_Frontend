import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

// ============================================================
//  React Query client — cấu hình cache và retry
// ============================================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,              // Chỉ retry 1 lần nếu request thất bại
      staleTime: 60_000,     // Cache tươi trong 1 phút
      gcTime: 5 * 60_000,    // Giữ cache 5 phút sau khi component unmount
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
