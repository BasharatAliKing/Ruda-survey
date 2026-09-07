import { Activity, ArrowUpRight, CheckCircle, ClipboardList, Clock, MapPin, Users } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

function Dashboard() {
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([api.getUsers(), api.getSurveys()])
      .then(([users, surveys]) =>
        setCounts({
          users: users.users?.length || 0,
          surveys: surveys.data?.length || 0,
          residential:
            surveys.data?.filter((item) => item.status === "residential")
              .length || 0,
          mapped: surveys.data?.filter((item) => item.coordinates?.lat && item.coordinates?.lng).length || 0,
          recent: surveys.data?.slice(-4).reverse() || [],
        }),
      )
      .catch((err) => setError(err.message));
  }, []);
  const isLoading = !counts;
  const stats = [
    {
      title: "Total Users",
      value: counts?.users ?? "-",
      icon: Users,
    },
    {
      title: "Total Surveys",
      value: counts?.surveys ?? "-",
      icon: ClipboardList,
    },
    {
      title: "Active Surveys",
      value: counts?.residential ?? "-",
      icon: CheckCircle,
    },
    {
      title: "Pending Surveys",
      value: counts ? Math.max(counts.surveys - counts.residential, 0) : "-",
      icon: Clock,
    },
  ];

  return (
    <div className="app-shell">
      <Sidebar />

      <Header />

      <main className="main-content">
        <div className="page-wrap">
          {/* Page Heading */}
          <div className="dashboard-intro">
            <div className="dashboard-intro-copy">
              <p className="eyebrow">Workspace / command center</p>
              <h1 className="page-title">A clearer view of every field record.</h1>
              <p className="page-subtitle">Monitor survey coverage, people and property activity from one calm workspace.</p>
            </div>
            <div className="intro-orbit"><MapPin size={24} /><span>Live field data</span></div>
          </div>

          {error && <div className="alert">{error}</div>}
          {/* Stats */}
          <div className="dashboard-stats">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className={`stat-card ${isLoading ? "is-loading" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stat-label">{stat.title}</p>

                      <h2 className="stat-value">{stat.value}</h2>
                    </div>

                    <div className="stat-icon">
                      <Icon size={25} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-panel coverage-panel">
              <div className="panel-heading"><div><p className="eyebrow">Coverage pulse</p><h2>Survey readiness</h2></div><Activity size={20} className="panel-icon" /></div>
              <div className="coverage-value"><strong>{counts ? Math.round((counts.residential / Math.max(counts.surveys, 1)) * 100) : 0}%</strong><span>residential records</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${counts ? Math.round((counts.residential / Math.max(counts.surveys, 1)) * 100) : 0}%` }} /></div>
              <div className="coverage-meta"><span><MapPin size={14} /> {counts?.mapped ?? 0} mapped</span><span><CheckCircle size={14} /> {counts?.residential ?? 0} active</span></div>
            </section>
            <section className="dashboard-panel activity-panel">
              <div className="panel-heading"><div><p className="eyebrow">Latest records</p><h2>Recent survey activity</h2></div><ArrowUpRight size={20} className="panel-icon" /></div>
              {isLoading ? <div className="activity-loading">Loading activity...</div> : counts.recent.length === 0 ? <div className="activity-loading">No survey activity yet.</div> : <div className="activity-list">{counts.recent.map((survey) => <div className="activity-item" key={survey._id}><div className="activity-dot" /><div><strong>{survey.identification?.owner_name || "Unnamed owner"}</strong><span>{survey.village || "Location pending"} · Survey #{survey.sr_no}</span></div><span className="activity-status">{survey.status || "Draft"}</span></div>)}</div>}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
