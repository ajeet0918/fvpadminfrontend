import { type FormEvent, useEffect, useMemo, useState } from "react";
import { API_BASE_URL, downloadAdminDocumentContentApi, uploadProductImageApi } from "../lib/api";
import { downloadBlob } from "../lib/downloads";
import type { Category, ProductStatus } from "../types/domain";
import { FormSection } from "./FormSection";

export type ProductFormValues = {
  name: string;
  slug: string;
  sku: string;
  price: string;
  priceUnit: string;
  defaultTaxRate: string;
  defaultDiscountRate: string;
  categoryId: string;
  status: ProductStatus;
  shortDescription: string;
  longDescription: string;
  moq: string;
  imageDocumentId: string;
  imageUrl: string;
  imageOriginalFileName: string;
  imageContentType: string;
  imageSizeBytes: string;
  featured: boolean;
};

type ProductFormProps = {
  title: string;
  categories: Category[];
  initialValues: ProductFormValues;
  loading?: boolean;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel: string;
  showDelete?: boolean;
  onDelete?: () => Promise<void> | void;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveApiOrigin(baseUrl: string) {
  try {
    return new URL(baseUrl).origin;
  } catch {
    return baseUrl;
  }
}

export function ProductForm({
  title,
  categories,
  initialValues,
  loading = false,
  onSubmit,
  onCancel,
  submitLabel,
  showDelete = false,
  onDelete
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setErrorMessage(null);
  }, [initialValues]);

  const legacyPreviewSrc = useMemo(() => {
    const url = values.imageUrl.trim();
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${resolveApiOrigin(API_BASE_URL)}${url}`;
    return url;
  }, [values.imageUrl]);

  const imageReference = values.imageDocumentId.trim() || values.imageUrl.trim();

  useEffect(() => {
    const documentId = values.imageDocumentId.trim();
    let active = true;
    let objectUrl: string | null = null;

    if (!documentId) {
      setPreviewSrc(legacyPreviewSrc);
      setPreviewLoading(false);
      return () => {
        active = false;
      };
    }

    setPreviewLoading(true);
    setPreviewSrc("");
    void downloadAdminDocumentContentApi(documentId)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewSrc(objectUrl);
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to load image preview.");
        }
      })
      .finally(() => {
        if (active) setPreviewLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [legacyPreviewSrc, values.imageDocumentId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save product.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImageFileSelected(file: File | null | undefined) {
    if (!file) return;
    setUploadingImage(true);
    setErrorMessage(null);
    try {
      const uploadResult = await uploadProductImageApi(file);
      setValues((current) => ({
        ...current,
        imageDocumentId: uploadResult.documentId,
        imageUrl: uploadResult.imageUrl,
        imageOriginalFileName: uploadResult.originalFileName ?? "",
        imageContentType: uploadResult.contentType ?? "",
        imageSizeBytes: uploadResult.sizeBytes != null ? String(uploadResult.sizeBytes) : ""
      }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleDownloadImage() {
    if (!imageReference) return;

    setDownloadingImage(true);
    setErrorMessage(null);
    try {
      const blob = await downloadAdminDocumentContentApi(imageReference);
      downloadBlob(blob, values.imageOriginalFileName || "product-image");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to download image.");
    } finally {
      setDownloadingImage(false);
    }
  }

  return (
    <article className="admin-form-card module-form-scroll">
      <h3 className="m-0 text-lg font-semibold text-text-primary">{title}</h3>
      <form className="mt-3 grid gap-4" onSubmit={handleSubmit}>
        <FormSection title="Catalog Details">
          <div className="form-grid-2">
            <label>
              Name
              <input
                required
                value={values.name}
                onChange={(event) => setValues((current) => ({
                  ...current,
                  name: event.target.value,
                  slug: current.slug || slugify(event.target.value)
                }))}
              />
            </label>
            <label>
              SKU
              <input
                required
                value={values.sku}
                onChange={(event) => setValues((current) => ({ ...current, sku: event.target.value.toUpperCase() }))}
              />
            </label>
            <label>
              Slug
              <input
                required
                value={values.slug}
                onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))}
              />
            </label>
            <label>
              Price
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(event) => setValues((current) => ({ ...current, price: event.target.value }))}
              />
            </label>
            <label>
              Price Unit
              <input
                required
                value={values.priceUnit}
                onChange={(event) => setValues((current) => ({ ...current, priceUnit: event.target.value.toLowerCase() }))}
                placeholder="kg, litre, bag"
              />
            </label>
            <label>
              Tax Rate (%)
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={values.defaultTaxRate}
                onChange={(event) => setValues((current) => ({ ...current, defaultTaxRate: event.target.value }))}
              />
            </label>
            <label>
              Discount Rate (%)
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={values.defaultDiscountRate}
                onChange={(event) => setValues((current) => ({ ...current, defaultDiscountRate: event.target.value }))}
              />
            </label>
            <label>
              Category
              <select
                required
                value={values.categoryId}
                onChange={(event) => setValues((current) => ({ ...current, categoryId: event.target.value }))}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                required
                value={values.status}
                onChange={(event) => setValues((current) => ({ ...current, status: event.target.value as ProductStatus }))}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </label>
            <label>
              MOQ
              <input
                required
                value={values.moq}
                onChange={(event) => setValues((current) => ({ ...current, moq: event.target.value }))}
              />
            </label>
          </div>

          <label className="inline-checkbox mt-3">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(event) => setValues((current) => ({ ...current, featured: event.target.checked }))}
            />
            Featured
          </label>
        </FormSection>

        <FormSection title="Descriptions">
          <div className="grid gap-3">
            <label>
              Short Description
              <textarea
                required
                rows={2}
                value={values.shortDescription}
                onChange={(event) => setValues((current) => ({ ...current, shortDescription: event.target.value }))}
              />
            </label>
            <label>
              Description
              <textarea
                required
                rows={4}
                value={values.longDescription}
                onChange={(event) => setValues((current) => ({ ...current, longDescription: event.target.value }))}
              />
            </label>
          </div>
        </FormSection>

        <FormSection title="Image">
          <div className="grid gap-3">
            <div className="grid gap-1">
              <strong className="text-sm text-text-primary">Product image</strong>
              <span className="table-muted">
                {values.imageOriginalFileName || (values.imageDocumentId ? "Uploaded image" : "No image selected")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="button-link button-link-secondary w-fit cursor-pointer">
                Select Local Image
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    void handleImageFileSelected(file);
                  }}
                />
              </label>
              {imageReference ? (
                <button
                  type="button"
                  className="button-link button-link-secondary"
                  onClick={() => void handleDownloadImage()}
                  disabled={downloadingImage}
                >
                  {downloadingImage ? "Downloading..." : "Download Image"}
                </button>
              ) : null}
              {uploadingImage ? <span className="table-muted">Uploading image...</span> : null}
            </div>
          </div>
          {previewLoading ? <p className="table-muted mt-3">Loading image preview...</p> : null}
          {previewSrc ? (
            <div className="image-preview-wrap mt-3">
              <img
                src={previewSrc}
                alt="Product preview"
                className="image-preview"
                onError={() => {
                  setPreviewSrc("");
                  setErrorMessage("Unable to display image preview.");
                }}
              />
            </div>
          ) : null}
        </FormSection>

        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        <div className="form-actions">
          <button type="submit" className="button-link" disabled={submitting || loading || uploadingImage}>
            {submitting ? "Saving..." : submitLabel}
          </button>
          {onCancel ? (
            <button type="button" className="button-link button-link-secondary" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
          {showDelete && onDelete ? (
            <button type="button" className="button-link button-danger" onClick={() => void onDelete()}>
              Delete
            </button>
          ) : null}
        </div>
      </form>
    </article>
  );
}
