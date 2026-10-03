import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  ListFilter,
  ShieldAlert,
  Activity,
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ScholarshipList } from './components/ScholarshipList';
import { ReviewQueue } from './components/ReviewQueue';
import { CrawlRunsView } from './components/CrawlRunsView';
import { ScholarshipDetailModal } from './components/ScholarshipDetailModal';
import { CloudShader } from './components/ui/cloud-shader';
import { Metrics, Scholarship, ChangeEvent } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scholarships' | 'review' | 'runs'>('dashboard');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [changes, setChanges] = useState<ChangeEvent[]>([]);
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGlobalData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/v1/metrics').then((r) => r.json()),
      fetch('/api/v1/scholarships?limit=100').then((r) => r.json()),
      fetch('/api/v1/changes').then((r) => r.json()),
    ])
      .then(([m, s, c]) => {
        setMetrics(m);
        setScholarships(s);
        setChanges(c);
      })
      .catch((err) => console.error('Error fetching global data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Ambient Blurred Cloud Shader Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <CloudShader
          className="w-full h-full filter blur-[3px] scale-105 opacity-80"
          speed={0.4}
          count={5}
          cloudColor="#ffffff"
          skyTopColor="#3876ba"
          skyBottomColor="#8cbfe8"
        />
        {/* Soft Frosted Glass Overlay for crisp text contrast */}
        <div className="absolute inset-0 bg-slate-50/85 backdrop-blur-[1px]" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-slate-900 tracking-tight">
                Scholarship Intelligence
              </span>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
                activeTab === 'dashboard'
                  ? 'bg-sky-50 text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('scholarships')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
                activeTab === 'scholarships'
                  ? 'bg-sky-50 text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Scholarships</span>
              <span className="text-[10px] font-mono bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full">
                {scholarships.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
                activeTab === 'review'
                  ? 'bg-sky-50 text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Review Queue</span>
              {(metrics?.review_required_count || 0) > 0 && (
                <span className="text-[10px] font-mono bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                  {metrics?.review_required_count}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('runs')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
                activeTab === 'runs'
                  ? 'bg-sky-50 text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Crawl Runs</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'dashboard' && (
          <Dashboard
            metrics={metrics}
            changes={changes}
            onRefresh={fetchGlobalData}
            onSelectScholarship={(id) => setSelectedScholarshipId(id)}
          />
        )}

        {activeTab === 'scholarships' && (
          <ScholarshipList
            scholarships={scholarships}
            onSelect={(id) => setSelectedScholarshipId(id)}
          />
        )}

        {activeTab === 'review' && <ReviewQueue />}

        {activeTab === 'runs' && <CrawlRunsView />}
      </main>

      {/* Modal Inspector */}
      {selectedScholarshipId && (
        <ScholarshipDetailModal
          scholarshipId={selectedScholarshipId}
          onClose={() => setSelectedScholarshipId(null)}
        />
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Scholarship Intelligence Engine</span>
          </div>
          <div>
            <span>Verified Official Opportunities</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
