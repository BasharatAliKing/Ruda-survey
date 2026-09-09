import { ExternalLink, FileText, X } from "lucide-react";
import { assetUrl } from "../lib/api";
const VITE_IMG_PATH = import.meta.env.VITE_IMG_URL;
const formatValue = (value) => {
  if (value === null || value === undefined || value === "")
    return "Not provided";
  return String(value);
};

function DetailSection({ title, fields }) {
  return (
    <section className="details-section">
      <p className="form-section-title">{title}</p>
      <div className="details-grid">
        {fields.map(([label, value]) => (
          <div className="detail-field" key={label}>
            <span>{label}</span>
            <strong>{formatValue(value)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function ViewModal({ isOpen, onClose, type, record }) {
  if (!isOpen || !record) return null;

  const isSurvey = type === "survey";
  const surveyFields = [
    {
      title: "Location & reference",
      fields: [
        ["Serial number", record.sr_no],
        ["Parcel ID", record.parcel_id],
        ["RD", record.rd],
        ["Package", record.pkg],
        ["Village", record.village],
        ["Latitude", record.coordinates?.lat],
        ["Longitude", record.coordinates?.lng],
      ],
    },
    {
      title: "Owner information",
      fields: [
        ["Owner name", record.identification?.owner_name],
        ["Father name", record.identification?.f_name],
        ["CNIC", record.identification?.cnic],
        ["Khasra number", record.identification?.khasra_no],
        ["Phone", record.identification?.phone],
        [
          "Electricity connection",
          record.identification?.electricity_connection_name,
        ],
        ["Land area", record.identification?.land_area],
      ],
    },
    {
      title: "Property details",
      fields: [
        ["Status", record.status],
        ["Structural name", record.stractural_name],
        ["Length", record.covered_area?.length],
        ["Width", record.covered_area?.width],
        ["Covered area", record.covered_area?.area],
        ["Construction type", record.nature_of_construction],
      ],
    },
  ];
  const userFields = [
    ["Username", record.user_name],
    ["Email address", record.email],
    ["Access role", record.role],
    ["Account ID", record._id || record.id],
    ["Password", "Protected"],
    [
      "Created",
      record.createdAt
        ? new Date(record.createdAt).toLocaleString()
        : "Not provided",
    ],
  ];
  const attachments = [
    ["Land owner document", record.identification?.land_owner_doc, "document"],
    ["Primary image", record.imgOne, "image"],
    ["Secondary image", record.imgTwo, "image"],
  ].filter(([, path]) => path);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="modal modal-wide details-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">
              {isSurvey ? "Survey record" : "People / access control"}
            </p>
            <h2>
              {isSurvey
                ? `Survey #${formatValue(record.sr_no)}`
                : record.user_name}
            </h2>
            <p className="modal-subtitle">Complete record details</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="details-content">
          {isSurvey ? (
            <>
              {surveyFields.map((section) => (
                <DetailSection key={section.title} {...section} />
              ))}
              <section className="details-section">
                <p className="form-section-title">Attachments</p>
                {attachments.length ? (
                  <div className="attachment-list">
                    {attachments.map(([label, path, attachmentType]) => {
                      const url = `${VITE_IMG_PATH}${path}`;
                      return attachmentType === "image" ? (
                        <div className="attachment-item" key={label}>
                          <img src={url} alt={label} />
                          <div>
                            <strong>{label}</strong>
                            <a href={url} target="_blank" rel="noreferrer">
                              <ExternalLink size={14} /> Open image
                            </a>
                          </div>
                        </div>
                      ) : (
                        <a
                          className="document-link"
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          key={label}
                        >
                          <FileText size={18} />
                          <span>{label}</span>
                          <ExternalLink size={14} />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="details-empty">No attachments available.</p>
                )}
              </section>
            </>
          ) : (
            <DetailSection title="Account details" fields={userFields} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewModal;
