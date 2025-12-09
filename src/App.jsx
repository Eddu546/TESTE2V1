import React from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import SearchResultsPage from '@/pages/SearchResultsPage';
import PoliticianProfilePage from '@/pages/PoliticianProfilePage';
import SenatorProfilePage from '@/pages/SenatorProfilePage'; // <--- Importei
import DnaPoliticoPage from '@/pages/DnaPoliticoPage';
import AboutPage from '@/pages/AboutPage';
import RoadmapPage from '@/pages/RoadmapPage';
import DeputadosPage from '@/pages/DeputadosPage';
import SenadoresPage from '@/pages/SenadoresPage';
import AnalyticsPage from '@/pages/AnalyticsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Helmet>
          <title>FISCALIZA - Transparência Política</title>
          <meta name="description" content="Plataforma de transparência política." />
        </Helmet>
        
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/politico/:id" element={<PoliticianProfilePage />} />
            <Route path="/senador/:id" element={<SenatorProfilePage />} /> {/* <--- Nova Rota */}
            <Route path="/deputados" element={<DeputadosPage />} />
            <Route path="/senadores" element={<SenadoresPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/meu-dna" element={<DnaPoliticoPage />} />
            <Route path="/sobre" element={<AboutPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
          </Routes>
        </main>
        
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;