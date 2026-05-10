import { useMemo } from "react";
import FormField from "./FormField";

function getDisplayName(value) {
  if (!value) return "";
  const cleanValue = value.split("?")[0].split("#")[0];
  const parts = cleanValue.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : cleanValue;
}

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
  const existingLabel = useMemo(() => getDisplayName(existingUrl), [existingUrl]);

  return (
    <div className="file-attachment-field stack-sm">
      <FormField label={label} hint={helperText}>
        <div className="upload-box stack-sm">
          <input className="input" type="file" accept={accept} onChange={(event) => onFileChange(event.target.files?.[0] || null)} />
          <div className="upload-meta">
            <span>Tệp đã chọn: {selectedLabel}</span>
            {existingUrl ? (
              <span className="upload-meta__existing">
                {file ? "Tệp cũ vẫn được giữ nếu bạn không tải tệp mới lên." : `Tệp hiện tại: ${existingLabel || "Đã có tệp đính kèm"}`}
                {" "}
                <a href={existingUrl} target="_blank" rel="noreferrer" className="text-link" title={existingLabel || "Tệp hiện tại"}>
                  Xem tệp hiện tại
                </a>
              </span>
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
