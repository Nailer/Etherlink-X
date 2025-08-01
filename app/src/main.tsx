import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider } from "thirdweb/react";
import './index.css'
import App from './App.tsx'

//745fc40a5fe64ab8fdaa882865986043

const client = createThirdwebClient({
  clientId: "745fc40a5fe64ab8fdaa882865986043",
});


createRoot(document.getElementById('root')!).render(
  <ThirdwebProvider>
    <App thirdwebClient={client}/>
  </ThirdwebProvider>
)
