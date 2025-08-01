"use client"

import { useState } from "react"
import { HomePage } from "./pages/HomePage"
import { ExchangePage } from "./pages/ExchangePage"
import "./App.css"
import type { ThirdwebClient } from "thirdweb";

interface AppProps {
  thirdwebClient: ThirdwebClient;
}

function App({thirdwebClient}: AppProps) {
  const [currentPage, setCurrentPage] = useState("home")

  const navigateTo = (page: string) => {
    setCurrentPage(page)
  }

  return (
    <div className="App">
      {currentPage === "home" && <HomePage onNavigate={navigateTo} />}
      {currentPage === "exchange" && <ExchangePage onNavigate={navigateTo} />}
    </div>
  )
}

export default App
