
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🎯 Main.tsx carregando...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Elemento root não encontrado!');
} else {
  console.log('✅ Elemento root encontrado, criando aplicação React...');
  createRoot(rootElement).render(<App />);
}
