import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NoMatch from "@/layout/NoMatch";

const Index = React.lazy(() => import("@/routes/Index"))

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <React.Suspense fallback={<>...</>}>
            <Index />
          </React.Suspense>
        } />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  )
}
