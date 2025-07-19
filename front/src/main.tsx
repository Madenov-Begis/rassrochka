import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import App from "./App"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
import "./index.css" 
import { ToastContainer } from "react-toastify"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById("root")!).render(
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      </QueryClientProvider>
)
