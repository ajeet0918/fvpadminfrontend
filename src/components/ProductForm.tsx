import { FormEvent, useEffect, useMemo, useState } from "react";
import { API_BASE_URL, uploadProductImageApi } from "../lib/api";
import type { Category, ProductStatus } from "../types/domain";

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
  imageUrl: string;
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setErrorMessage(null);
  }, [initialValues]);

  const previewSrc = useMemo(() => {
    const url = values.imageUrl.trim();
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
    return url;
  }, [values.imageUrl]);

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
    if (!file) {
      return;
    }
    setUploadingImage(true);
    setErrorMessage(null);
    try {
      const uploadResult = await uploadProductImageApi(file);
      setValues((current) => ({ ...current, imageUrl: uploadResult.imageUrl }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <article className="admin-form-card">
      <h3>{title}</h3>
      <form className="user-form-grid" onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <label>
            Name
            <input
              value={values.name}
              onChange={(event) => setValues((current) => ({
                ...current,
                name: event.target.value,
                slug: current.slug || slugify(event.target.value)
              }))}
              required
            />
          </label>
          <label>
            SKU
            <input
              value={values.sku}
              onChange={(event) => setValues((current) => ({ ...current, sku: event.target.value.toUpperCase() }))}
              required
            />
          </label>
          <label>
            Slug
            <input
              value={values.slug}
              onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))}
              required
            />
          </label>
          <label>
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.price}
              onChange={(event) => setValues((current) => ({ ...current, price: event.target.value }))}
              required
            />
          </label>
          <label>
            Price Unit
            <input
              value={values.priceUnit}
              onChange={(event) => setValues((current) => ({ ...current, priceUnit: event.target.value.toLowerCase() }))}
              placeholder="kg, litre, bag"
              required
            />
          </label>
          <label>
            Tax Rate (%)
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={values.defaultTaxRate}
              onChange={(event) => setValues((current) => ({ ...current, defaultTaxRate: event.target.value }))}
              required
            />
          </label>
          <label>
            Discount Rate (%)
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={values.defaultDiscountRate}
              onChange={(event) => setValues((current) => ({ ...current, defaultDiscountRate: event.target.value }))}
              required
            />
          </label>
          <label>
            Category
            <select
              value={values.categoryId}
              onChange={(event) => setValues((current) => ({ ...current, categoryId: event.target.value }))}
              required
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
              value={values.status}
              onChange={(event) => setValues((current) => ({ ...current, status: event.target.value as ProductStatus }))}
              required
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </label>
          <label>
            MOQ
            <input
              value={values.moq}
              onChange={(event) => setValues((current) => ({ ...current, moq: event.target.value }))}
              required
            />
          </label>
          <label className="inline-checkbox">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(event) => setValues((current) => ({ ...current, featured: event.target.checked }))}
            />
            Featured
          </label>
        </div>

        <label>
          Short Description
          <textarea
            rows={2}
            value={values.shortDescription}
            onChange={(event) => setValues((current) => ({ ...current, shortDescription: event.target.value }))}
            required
          />
        </label>
        <label>
          Description
          <textarea
            rows={4}
            value={values.longDescription}
            onChange={(event) => setValues((current) => ({ ...current, longDescription: event.target.value }))}
            required
          />
        </label>

        <div className="form-grid-2">
          <label>
            Image URL
            <input
              value={values.imageUrl}
              onChange={(event) => setValues((current) => ({ ...current, imageUrl: event.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </label>
          <label>
            Local Image Preview
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                void handleImageFileSelected(file);
              }}
            />
            {uploadingImage ? <small className="table-muted">Uploading image...</small> : null}
          </label>
        </div>

        {previewSrc ? (
          <div className="image-preview-wrap">
            <img src={previewSrc} alt="Product preview" className="image-preview" />
          </div>
        ) : null}

        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        <div className="row">
          <button type="submit" disabled={submitting || loading || uploadingImage}>
            {submitting ? "Saving..." : submitLabel}
          </button>
          {onCancel ? (
            <button type="button" className="button-muted" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
          {showDelete && onDelete ? (
            <button type="button" className="button-danger button-muted" onClick={() => void onDelete()}>
              Delete
            </button>
          ) : null}
        </div>
      </form>
    </article>
  );
}
