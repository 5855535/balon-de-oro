import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryTabs } from './components/CategoryTabs';
import { BallonDorVoting } from './components/voting/BallonDorVoting';
import { GuanteDeOroVoting } from './components/voting/GuanteDeOroVoting';
import { QuintetoIdealVoting } from './components/voting/QuintetoIdealVoting';
import { GoleadorVoting } from './components/voting/GoleadorVoting';
import { LoginScreen } from './components/LoginScreen';
import { BallotSummaryModal } from './components/modals/BallotSummaryModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { Shield } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeCategory, setActiveCategory, currentUser } = useApp();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBallotOpen, setIsBallotOpen] = useState(false);

  // If not logged in, enforce login first!
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gala-black text-gray-100 flex flex-col font-sans selection:bg-gold-500 selection:text-black">
      
      {/* Navbar */}
      <Navbar
        onOpenLogin={() => {}}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenBallotSummary={() => setIsBallotOpen(true)}
      />

      {/* Hero Category Banner */}
      <HeroBanner category={activeCategory} />

      {/* Category Pills Navigation (ballondor.com style) */}
      <CategoryTabs
        activeTab={activeCategory}
        onSelectTab={setActiveCategory}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {activeCategory === 'ballon_dor' && <BallonDorVoting />}
        {activeCategory === 'guante_oro' && <GuanteDeOroVoting />}
        {activeCategory === 'quinteto_ideal' && <QuintetoIdealVoting />}
        {activeCategory === 'goleador' && <GoleadorVoting />}
      </main>

      {/* Official Gala Footer */}
      <footer className="mt-12 border-t border-white/10 bg-[#090A0D] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-baseline space-x-1 justify-center md:justify-start">
                <span className="font-brand font-light tracking-[0.24em] text-sm text-white uppercase">
                  BALLON D'OR
                </span>
                <span className="text-[9px] text-gold-500 font-bold">™</span>
              </div>
              <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase mt-0.5">
                Gala Oficial Futsal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-400">
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setIsAdminOpen(true)}
                className="hover:text-gold-400 transition-colors flex items-center space-x-1"
              >
                <Shield className="w-3.5 h-3.5 text-gold-500" />
                <span>Panel Administrador</span>
              </button>
            )}
            <span>•</span>
            <span className="text-gray-500">Temporada Oficial 2025/2026</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BallotSummaryModal
        isOpen={isBallotOpen}
        onClose={() => setIsBallotOpen(false)}
        onNavigateToCategory={(cat) => setActiveCategory(cat)}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
