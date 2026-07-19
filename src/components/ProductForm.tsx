import { type FormEvent, useEffect, useMemo, useState } from "react";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { API_BASE_URL, downloadAdminDocumentContentApi, uploadProductImageApi } from "../lib/api";
import { downloadBlob } from "../lib/downloads";
import type { Category, ProductStatus } from "../types/domain";
import { FormActions } from "./FormActions";
import { FormSection } from "./FormSection";
import { ErrorBanner } from "./PageState";

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
  description?: string;
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
  description,
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
    <article className="admin-form-card form-page-card">
      <header className="form-card-header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      <form className="admin-edit-form" onSubmit={handleSubmit} aria-busy={submitting || uploadingImage}>
        <FormSection
          title="Catalog details"
          subtitle="Information buyers use to identify, price, and order this product."
        >
          <div className="form-grid-2">
            <label>
              Product name
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
              Storefront slug
              <input
                required
                value={values.slug}
                onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))}
              />
            </label>
            <label>
              Base price
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
              Tax rate (%)
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
              Default discount (%)
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
              Storefront status
              <select
                required
                value={values.status}
                onChange={(event) => setValues((current) => ({ ...current, status: event.target.value as ProductStatus }))}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
            <label>
              Minimum order quantity
              <input
                required
                value={values.moq}
                onChange={(event) => setValues((current) => ({ ...current, moq: event.target.value }))}
                placeholder="For example, 100 kg"
              />
            </label>
          </div>

          <label className="inline-checkbox mt-4">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(event) => setValues((current) => ({ ...current, featured: event.target.checked }))}
            />
            Feature this product on the storefront
          </label>
        </FormSection>

        <FormSection
          title="Product descriptions"
          subtitle="Keep the short description concise and use the full description for specifications and buyer context."
        >
          <div className="grid gap-3">
            <label>
              Short description
              <textarea
                required
                rows={2}
                value={values.shortDescription}
                onChange={(event) => setValues((current) => ({ ...current, shortDescription: event.target.value }))}
              />
            </label>
            <label>
              Full description
              <textarea
                required
                rows={4}
                value={values.longDescription}
                onChange={(event) => setValues((current) => ({ ...current, longDescription: event.target.value }))}
              />
            </label>
          </div>
        </FormSection>

        <FormSection
          title="Product image"
          subtitle="Upload a clear product photograph. The image is stored using the existing document service."
        >
          <div className="product-image-editor">
            <div className="product-image-preview">
              {previewLoading ? <span className="table-muted">Loading preview...</span> : null}
              {!previewLoading && previewSrc ? (
                <img
                  src={previewSrc}
                  alt={`${values.name || "Product"} preview`}
                  className="image-preview"
                  onError={() => {
                    setPreviewSrc("");
                    setErrorMessage("Unable to display image preview.");
                  }}
                />
              ) : null}
              {!previewLoading && !previewSrc ? (
                <div className="image-empty-state">
                  <ImageOutlinedIcon />
                  <span>No image selected</span>
                </div>
              ) : null}
            </div>
            <div className="product-image-controls">
              <div>
                <strong className="text-sm text-text-primary">
                  {values.imageOriginalFileName || "Choose a product image"}
                </strong>
                <p className="field-help">
                  JPG, PNG, or WebP works best. Use a landscape image with the product clearly visible.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="button-link button-link-secondary w-fit cursor-pointer">
                  <UploadFileRoundedIcon fontSize="small" />
                  {uploadingImage ? "Uploading..." : "Choose image"}
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadingImage}
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
                    <DownloadRoundedIcon fontSize="small" />
                    {downloadingImage ? "Downloading..." : "Download"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </FormSection>

        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

        <FormActions
          submitLabel={submitLabel}
          submitting={submitting}
          disabled={loading || uploadingImage}
          onCancel={onCancel}
          dangerAction={showDelete && onDelete ? { label: "Delete product", onClick: () => void onDelete() } : undefined}
        />
      </form>
    </article>
  );
}
