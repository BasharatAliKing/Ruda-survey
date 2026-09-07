import { useEffect, useState } from "react";
import { X } from "lucide-react";

const emptySurvey = {
  sr_no: "",
  parcel_id: "",
  rd: "",
  pkg: "",
  village: "",
  lat: "",
  lng: "",
  owner_name: "",
  f_name: "",
  cnic: "",
  khasra_no: "",
  phone: "",
  electricity_connection_name: "",
  land_area: "",
  status: "",
  stractural_name: "",
  length: "",
  width: "",
  area: "",
  nature_of_construction: "",
};

function SurveyModal({ isOpen, onClose, onSave, editingSurvey }) {
  const [form, setForm] = useState(emptySurvey);
  const [files, setFiles] = useState({
    land_owner_doc: null,
    imgOne: null,
    imgTwo: null,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      editingSurvey
        ? {
            sr_no: editingSurvey.sr_no ?? "",
            parcel_id: editingSurvey.parcel_id ?? "",
            rd: editingSurvey.rd ?? "",
            pkg: editingSurvey.pkg ?? "",
            village: editingSurvey.village ?? "",
            lat: editingSurvey.coordinates?.lat ?? "",
            lng: editingSurvey.coordinates?.lng ?? "",
            owner_name: editingSurvey.identification?.owner_name ?? "",
            f_name: editingSurvey.identification?.f_name ?? "",
            cnic: editingSurvey.identification?.cnic ?? "",
            khasra_no: editingSurvey.identification?.khasra_no ?? "",
            phone: editingSurvey.identification?.phone ?? "",
            electricity_connection_name:
              editingSurvey.identification?.electricity_connection_name ?? "",
            land_area: editingSurvey.identification?.land_area ?? "",
            status: editingSurvey.status ?? "",
            stractural_name: editingSurvey.stractural_name ?? "",
            length: editingSurvey.covered_area?.length ?? "",
            width: editingSurvey.covered_area?.width ?? "",
            area: editingSurvey.covered_area?.area ?? "",
            nature_of_construction: editingSurvey.nature_of_construction ?? "",
          }
        : emptySurvey,
    );
    setFiles({ land_owner_doc: null, imgOne: null, imgTwo: null });
    setError("");
  }, [editingSurvey, isOpen]);

  if (!isOpen) return null;

  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const field = (name, label, type = "text") => (
    <label className="field" key={name}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={form[name]}
        onChange={update}
        placeholder={label}
      />
    </label>
  );

  const submit = async (event) => {
    event.preventDefault();
    if (!form.sr_no || !form.owner_name) {
      setError("Serial number and owner name are required.");
      return;
    }
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    Object.entries(files).forEach(([key, file]) => {
      if (file) data.append(key, file);
    });
    try {
      await onSave(data);
      onClose();
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal modal-wide">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Survey record</p>
            <h2>{editingSurvey ? "Edit survey" : "Add survey"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="survey-form">
          <section>
            <p className="form-section-title">Location & reference</p>
            <div className="form-grid">
              {field("sr_no", "Serial number", "number")}
              {field("parcel_id", "Parcel ID")}
              {field("rd", "RD")}
              {field("pkg", "Package")}
              {field("village", "Village")}
              {field("lat", "Latitude", "number")}
              {field("lng", "Longitude", "number")}
            </div>
          </section>
          <section>
            <p className="form-section-title">Owner information</p>
            <div className="form-grid">
              {field("owner_name", "Owner name")}
              {field("f_name", "Father name")}
              {field("cnic", "CNIC")}
              {field("khasra_no", "Khasra number")}
              {field("phone", "Phone")}
              {field("electricity_connection_name", "Electricity connection")}
              {field("land_area", "Land area")}
            </div>
          </section>
          <section>
            <p className="form-section-title">Property details</p>
            <div className="form-grid">
              {field("status", "Status")}
              {field("stractural_name", "Structural name")}
              {field("length", "Length")}
              {field("width", "Width")}
              {field("area", "Covered area")}
              {field("nature_of_construction", "Construction type")}
            </div>
          </section>
          <section>
            <p className="form-section-title">Attachments</p>
            <div className="file-grid">
              {[
                ["land_owner_doc", "Land owner document"],
                ["imgOne", "Primary image"],
                ["imgTwo", "Secondary image"],
              ].map(([name, label]) => (
                <label className="file-field" key={name}>
                  <span>{label}</span>
                  <input
                    type="file"
                    name={name}
                    accept={
                      name === "land_owner_doc" ? ".pdf,.doc,.docx" : "image/*"
                    }
                    onChange={(event) =>
                      setFiles((current) => ({
                        ...current,
                        [name]: event.target.files[0],
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </section>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button
              type="button"
              className="button button-muted"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button button-primary" type="submit">
              {editingSurvey ? "Save changes" : "Create survey"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SurveyModal;
