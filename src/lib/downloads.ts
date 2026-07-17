const FILE_EXTENSIONS: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "text/csv": ".csv",
  "text/plain": ".txt"
};

function normalizeFileName(fileName: string, contentType: string) {
  const safeName = fileName.trim().replace(/[<>:"/\\|?*]+/g, "-") || "download";
  if (safeName.includes(".")) {
    return safeName;
  }

  return `${safeName}${FILE_EXTENSIONS[contentType.toLowerCase()] ?? ""}`;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = normalizeFileName(fileName, blob.type);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}
