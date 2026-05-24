import { useState } from 'react'
import CarViewer from './components/CarViewer'
import HeroUI from './components/HeroUI'
import LoaderUI from './components/LoaderUI'
import SpecsPage from './components/SpecsPage'
import ReportPage from './components/ReportPage'
import './App.css'

export default function App() {
  const [page, setPage] = useState('home') // 'home' | 'specs' | 'report'

  return (
    <div className="app">
      {page === 'home' && (
        <>
          <LoaderUI />
          <CarViewer />
          <HeroUI onViewSpecs={() => setPage('specs')} onViewReport={() => setPage('report')} onHome={() => setPage('home')} />
        </>
      )}
      {page === 'specs' && (
        <SpecsPage onBack={() => setPage('home')} onViewReport={() => setPage('report')} onHome={() => setPage('home')} />
      )}
      {page === 'report' && (
        <ReportPage onBack={() => setPage('specs')} onHome={() => setPage('home')} />
      )}
    </div>
  )
}
