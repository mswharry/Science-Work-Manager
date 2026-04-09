import { useMemo } from "react";
import FormField from "./FormField";

export default function FileAttachmentField({
  label,
  file,
  onFileChange,
  linkValue,
  onLinkChange,
  existingUrl,
  accept,
  helperText,
}) {
  const selectedLabel = useMemo(() => (file ? file.name : "Chưa chọn tệp"), [file]);

  return (
    <div className="file-attachment-field stack-sm">
      <FormField label={label} hint={helperText}>
        <div className="upload-box stack-sm">
          <input className="input" type="file" accept={accept} onChange={(event) => onFileChange(event.target.files?.[0] || null)} />
          <div className="upload-meta">
            <span>Tệp đã chọn: {selectedLabel}</span>
            {existingUrl && !file ? (
              <a href={existingUrl} target="_blank" rel="noreferrer" className="text-link">
                Xem tệp hiện tại
              </a>
            ) : null}
          </div>
          <div className="upload-separator">hoặc dùng liên kết ngoài</div>
          <input
            className="input"
            value={linkValue}
            onChange={(event) => onLinkChange(event.target.value)}
            placeholder="https://... hoặc đường dẫn lưu trữ"
          />
        </div>
      </FormField>
    </div>
  );
}
