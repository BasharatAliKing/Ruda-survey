import { useEffect, useMemo, useRef, useState } from "react";
import { FileUp, MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import SurveyModal from "../components/surveys/SurveyModal";
import { api } from "../lib/api";

function Surveys() {
  const [allSurveys, setAllSurveys] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const importRef = useRef(null);

  const loadSurveys = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await api.getSurveys();
      setAllSurveys(payload.data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const filteredSurveys = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allSurveys.filter((survey) => {
      const matchesSearch = [survey.sr_no].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(term),
      );
      return matchesSearch && (status === "all" || survey.status === status);
    });
  }, [allSurveys, search, status]);

  const totalPages = Math.max(Math.ceil(filteredSurveys.length / pageSize), 1);
  const visibleSurveys = filteredSurveys.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const firstRecord = filteredSurveys.length ? (page - 1) * pageSize + 1 : 0;
  const lastRecord = Math.min(page * pageSize, filteredSurveys.length);

  useEffect(() => {
    setPage(1);
  }, [search, status, pageSize]);

  const saveSurvey = async (formData) => {
    if (editingSurvey) await api.updateSurvey(editingSurvey._id, formData);
    else await api.createSurvey(formData);
    await loadSurveys();
  };

  const deleteSurvey = async (id) => {
    if (!window.confirm("Delete this survey record?")) return;
    try {
      await api.deleteSurvey(id);
      await loadSurveys();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const importFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    try {
      await api.importSurveys(data);
      await loadSurveys();
    } catch (importError) {
      setError(importError.message);
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <Header />
      <main className="main-content">
        <div className="page-wrap">
          <div className="page-heading">
            <div>
              <p className="eyebrow">Workspace / field records</p>
              <h1>Surveys</h1>
              <p className="page-subtitle">
                Browse property records in focused pages of data.
              </p>
            </div>
            <div className="heading-actions">
              <button
                className="button button-muted"
                onClick={() => importRef.current?.click()}
              >
                <FileUp size={17} /> Import Excel
              </button>
              <input
                ref={importRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={importFile}
                hidden
              />
              <button
                className="button button-primary"
                onClick={() => {
                  setEditingSurvey(null);
                  setModalOpen(true);
                }}
              >
                <Plus size={18} /> Add survey
              </button>
            </div>
          </div>

          {error && <div className="alert">{error}</div>}
          <div className="metric-row">
            <div>
              <span className="metric-label">Total records</span>
              <strong>{allSurveys.length}</strong>
            </div>
            <div>
              <span className="metric-label">Matching records</span>
              <strong>{filteredSurveys.length}</strong>
            </div>
            <div>
              <span className="metric-label">Records per page</span>
              <strong>{pageSize}</strong>
            </div>
          </div>

          <div className="table-card">
            <div className="table-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  className="search-input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search owner, parcel or village"
                />
              </div>
              <div className="table-filters">
                <select
                  className="filter-select"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="agri">Agricultural</option>
                  <option value="deras">Deras</option>
                  <option value="other">Other</option>
                </select>
                <label className="page-size-control">
                  Show
                  <select
                    className="filter-select"
                    value={pageSize}
                    onChange={(event) =>
                      setPageSize(Number(event.target.value))
                    }
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Owner</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Coordinates</th>
                    <th className="align-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        <span className="loading-spinner" /> Loading survey
                        records...
                      </td>
                    </tr>
                  ) : visibleSurveys.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        No survey records found.
                      </td>
                    </tr>
                  ) : (
                    visibleSurveys.map((survey) => (
                      <tr key={survey._id}>
                        <td>
                          <p className="cell-title">#{survey.sr_no}</p>
                          <p className="cell-meta">
                            {survey.parcel_id || "No parcel ID"}
                          </p>
                        </td>
                        <td>
                          <p className="cell-title">
                            {survey.identification?.owner_name ||
                              "Unknown owner"}
                          </p>
                          <p className="cell-meta">
                            {survey.identification?.phone || "No phone"}
                          </p>
                        </td>
                        <td>
                          <p className="cell-title">
                            {survey.village || "Unassigned"}
                          </p>
                          <p className="cell-meta">
                            {survey.rd || "No RD"}{" "}
                            {survey.pkg ? `· ${survey.pkg}` : ""}
                          </p>
                        </td>
                        <td>
                          <span
                            className={`status-pill status-${survey.status || "other"}`}
                          >
                            {survey.status || "Unspecified"}
                          </span>
                        </td>
                        <td className="cell-text">
                          {survey.coordinates?.lat &&
                          survey.coordinates?.lng ? (
                            <span className="location">
                              <MapPin size={15} /> {survey.coordinates.lat},{" "}
                              {survey.coordinates.lng}
                            </span>
                          ) : (
                            "Not set"
                          )}
                        </td>
                        <td className="align-right">
                          <button
                            className="icon-button icon-blue"
                            title="Edit"
                            onClick={() => {
                              setEditingSurvey(survey);
                              setModalOpen(true);
                            }}
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            className="icon-button icon-red"
                            title="Delete"
                            onClick={() => deleteSurvey(survey._id)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="pagination-bar">
              <span>
                Showing {firstRecord}–{lastRecord} of {filteredSurveys.length}
              </span>
              <div className="pagination-actions">
                <button
                  className="page-button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>
                <span className="page-number">
                  {page} / {totalPages}
                </span>
                <button
                  className="page-button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SurveyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={saveSurvey}
        editingSurvey={editingSurvey}
      />
    </div>
  );
}

export default Surveys;
