import { useEffect, useMemo, useState } from "react";
import { CheckCircle, ClipboardList, Clock, MapPin, Users } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Map from "../components/surveys/Map";
import { api } from "../lib/api";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [error, setError] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  useEffect(() => {
    Promise.all([api.getUsers(), api.getSurveys()])
      .then(([usersPayload, surveysPayload]) => {
        setUsers(usersPayload.users || []);
        setSurveys(surveysPayload.data || []);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const mappedSurveys = useMemo(
    () =>
      surveys
        .filter(
          (survey) =>
            survey.coordinates?.lat != null && survey.coordinates?.lng != null,
        )
        .map((survey) => ({
          id: survey._id,
          srNo: survey.sr_no,
          siteName: survey.identification?.owner_name || "Unknown owner",
          plantCode: survey.parcel_id || "No parcel ID",
          plantType: survey.status || "Unspecified",
          location: survey.village || "Unassigned",
          capacity: survey.identification?.land_area || "-",
          latitude: survey.coordinates.lat,
          longitude: survey.coordinates.lng,
          phone: survey.identification?.phone,
          status: survey.status,
          isSurveyed: true,
        })),
    [surveys],
  );

  const stats = [
    { title: "Total Users", value: users.length, icon: Users },
    { title: "Total Surveys", value: surveys.length, icon: ClipboardList },
    {
      title: "Active Surveys",
      value: surveys.filter((survey) => survey.status === "residential").length,
      icon: CheckCircle,
    },
    {
      title: "Pending Surveys",
      value: surveys.filter((survey) => survey.status !== "residential").length,
      icon: Clock,
    },
  ];

  return (
    <div className="app-shell">
      <Sidebar />
      <Header />
      <main className="main-content">
        <div className="page-wrap">
          <div className="dashboard-intro">
            <div className="dashboard-intro-copy">
              <p className="eyebrow">Workspace / command center</p>
              <h1 className="page-title">
                A clearer view of every field record.
              </h1>
              <p className="page-subtitle">
                Monitor survey coverage, people and property activity from one
                calm workspace.
              </p>
            </div>
            <div className="intro-orbit">
              <MapPin size={24} />
              <span>Live field data</span>
            </div>
          </div>

          {error && <div className="alert">{error}</div>}
          <div className="dashboard-stats mb-7">
            {stats.map(({ title, value, icon: Icon }) => (
              <div key={title} className="stat-card">
                <p className="stat-label">{title}</p>
                <h2 className="stat-value">{value}</h2>
                <div className="stat-icon">
                  <Icon size={25} />
                </div>
              </div>
            ))}
          </div>

          <Map
            mappedPlants={mappedSurveys}
            selectedPlant={selectedSurvey}
            onSelectPlant={setSelectedSurvey}
            isLight
            surface="border-[#dbe6e3] bg-white"
            softSurface="border-[#dbe6e3] bg-white text-slate-700"
            textMuted="text-slate-500"
          />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
