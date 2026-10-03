import React, { useState, useEffect } from 'react';
import {
  HugeiconsIcon,
  DashboardSquare01Icon,
  Mortarboard01Icon,
  ShieldAlertIcon,
  Activity01Icon,
  CheckmarkCircle02Icon,
} from './components/ui/icons';
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

  const fetchGlobalData = () => {
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
      .catch((err) => console.error('Error fetching global data:', err));
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row font-bricolage selection:bg-slate-900 selection:text-white">
      {/* Ambient Blurred Cloud Shader Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <CloudShader
          className="w-full h-full filter blur-[3px] scale-105 opacity-80"
          speed={0.3}
          count={5}
          cloudColor="#ffffff"
          skyTopColor="#3876ba"
          skyBottomColor="#8cbfe8"
        />
        {/* Soft Frosted Glass Overlay */}
        <div className="absolute inset-0 bg-slate-100/75 backdrop-blur-[2px]" />
      </div>

      {/* Floating Rounded Side Navbar */}
      <aside className="relative z-30 md:sticky md:top-6 md:self-start md:h-[calc(100vh-3rem)] m-4 md:m-6 md:mr-0 w-auto md:w-64 shrink-0 flex flex-col justify-between p-5 rounded-3xl clay-card">
        <div className="space-y-6">
          {/* Brand Header - Typographic Wordmark with Bricolage Grotesque (No Logo) */}
          <div className="px-2 py-1">
            <h1 className="font-bricolage text-xl sm:text-2xl font-black text-black tracking-tight leading-tight">
              Scholarship
            </h1>
            <p className="font-bricolage text-xs font-bold text-black/65 tracking-widest uppercase mt-0.5">
              Intelligence
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible py-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-3 transition-all ${
                activeTab === 'dashboard'
                  ? 'clay-btn-dark'
                  : 'clay-btn'
              }`}
            >
              <HugeiconsIcon icon={DashboardSquare01Icon} size={18} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('scholarships')}
              className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
                activeTab === 'scholarships'
                  ? 'clay-btn-dark'
                  : 'clay-btn'
              }`}
            >
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={Mortarboard01Icon} size={18} />
                <span>Scholarships</span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'scholarships'
                    ? 'bg-white/20 text-white'
                    : 'bg-black/10 text-black'
                }`}
              >
                {scholarships.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
                activeTab === 'review'
                  ? 'clay-btn-dark'
                  : 'clay-btn'
              }`}
            >
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={ShieldAlertIcon} size={18} />
                <span>Review Queue</span>
              </div>
              {(metrics?.review_required_count || 0) > 0 && (
                <span className="text-[10px] font-mono font-bold bg-amber-500 text-black px-2 py-0.5 rounded-full">
                  {metrics?.review_required_count}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('runs')}
              className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-3 transition-all ${
                activeTab === 'runs'
                  ? 'clay-btn-dark'
                  : 'clay-btn'
              }`}
            >
              <HugeiconsIcon icon={Activity01Icon} size={18} />
              <span>Crawl Runs</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="relative z-10 flex-1 p-4 md:p-6 w-full max-w-7xl mx-auto overflow-x-hidden">
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
    </div>
  );
}

export default App;
