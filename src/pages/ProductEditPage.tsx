import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BackLink } from "../components/BackLink";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner, LoadingState } from "../components/PageState";
import { ProductForm, type ProductFormValues } from "../components/ProductForm";
import {
  deleteAdminProductApi,
  fetchAdminProductApi,
  fetchCategoriesApi,
  readErrorMessage,
  updateAdminProductApi
} from "../lib/api";
import type { Category } from "../types/domain";

const emptyValues: ProductFormValues = {
  name: "",
  slug: "",
  sku: "",
  price: "0",
  priceUnit: "kg",
  defaultTaxRate: "5",
  defaultDiscountRate: "0",
  categoryId: "",
  status: "ACTIVE",
  shortDescription: "",
  longDescription: "",
  moq: "",
  imageDocumentId: "",
  imageUrl: "",
  imageOriginalFileName: "",
  imageContentType: "",
  imageSizeBytes: "",
  featured: false
};

export function ProductEditPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [values, setValues] = useState<ProductFormValues>(emptyValues);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isValidId = useMemo(() => Number.isFinite(productId), [productId]);

  useEffect(() => {
    async function loadPageData() {
      if (!isValidId) {
        setErrorMessage("Invalid product id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [product, categoryList] = await Promise.all([
          fetchAdminProductApi(productId),
          fetchCategoriesApi()
        ]);
        setCategories(categoryList);
        setValues({
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: String(product.price ?? 0),
          priceUnit: product.priceUnit ?? "kg",
          defaultTaxRate: String(product.defaultTaxRate ?? 0),
          defaultDiscountRate: String(product.defaultDiscountRate ?? 0),
          categoryId: String(product.categoryId),
          status: product.status,
          shortDescription: product.shortDescription,
          longDescription: product.longDescription,
          moq: product.moq,
          imageDocumentId: product.imageDocumentId ?? "",
          imageUrl: product.imageUrl ?? "",
          imageOriginalFileName: product.imageOriginalFileName ?? "",
          imageContentType: product.imageContentType ?? "",
          imageSizeBytes: product.imageSizeBytes != null ? String(product.imageSizeBytes) : "",
          featured: product.featured
        });
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load product."));
      } finally {
        setLoading(false);
      }
    }

    void loadPageData();
  }, [isValidId, productId]);

  async function handleSubmit(nextValues: ProductFormValues) {
    await updateAdminProductApi(productId, {
      name: nextValues.name.trim(),
      slug: nextValues.slug.trim().toLowerCase(),
      sku: nextValues.sku.trim().toUpperCase(),
      price: Number(nextValues.price),
      priceUnit: nextValues.priceUnit.trim().toLowerCase(),
      defaultTaxRate: Number(nextValues.defaultTaxRate),
      defaultDiscountRate: Number(nextValues.defaultDiscountRate),
      status: nextValues.status,
      imageDocumentId: nextValues.imageDocumentId.trim() || null,
      imageUrl: nextValues.imageUrl.trim() || null,
      imageOriginalFileName: nextValues.imageOriginalFileName.trim() || null,
      imageContentType: nextValues.imageContentType.trim() || null,
      imageSizeBytes: nextValues.imageSizeBytes.trim() ? Number(nextValues.imageSizeBytes) : null,
      shortDescription: nextValues.shortDescription.trim(),
      longDescription: nextValues.longDescription.trim(),
      moq: nextValues.moq.trim(),
      featured: nextValues.featured,
      categoryId: Number(nextValues.categoryId)
    });
    navigate("/products");
  }

  function handleDelete() {
    setDeleteConfirmationOpen(true);
  }

  async function confirmDelete() {
    setDeleting(true);
    setErrorMessage(null);
    try {
      await deleteAdminProductApi(productId);
      navigate("/products");
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to delete product."));
      setDeleteConfirmationOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="Edit product"
        subtitle="Update catalog information, storefront visibility, pricing, and imagery."
        actions={<BackLink to="/products" label="Back to products" />}
      />
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {loading ? <LoadingState label="Loading product..." /> : (
        <ProductForm
          title="Product information"
          description="Changes affect the public catalog when this product is active."
          categories={categories}
          initialValues={values}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/products")}
          submitLabel="Save changes"
          showDelete
          onDelete={handleDelete}
        />
      )}
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        title="Delete product?"
        message="This will permanently remove the product from the catalog. This action cannot be undone."
        confirmLabel="Delete Product"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteConfirmationOpen(false)}
      />
    </section>
  );
}
