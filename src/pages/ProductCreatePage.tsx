import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { ProductForm, type ProductFormValues } from "../components/ProductForm";
import { createAdminProductApi, fetchCategoriesApi, readErrorMessage } from "../lib/api";
import type { Category } from "../types/domain";

const initialValues: ProductFormValues = {
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
  imageUrl: "",
  featured: false
};

export function ProductCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const result = await fetchCategoriesApi();
        setCategories(result);
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load categories."));
      } finally {
        setLoading(false);
      }
    }

    void loadCategories();
  }, []);

  async function handleSubmit(values: ProductFormValues) {
    await createAdminProductApi({
      name: values.name.trim(),
      slug: values.slug.trim().toLowerCase(),
      sku: values.sku.trim().toUpperCase(),
      price: Number(values.price),
      priceUnit: values.priceUnit.trim().toLowerCase(),
      defaultTaxRate: Number(values.defaultTaxRate),
      defaultDiscountRate: Number(values.defaultDiscountRate),
      status: values.status,
      imageUrl: values.imageUrl.trim() || null,
      shortDescription: values.shortDescription.trim(),
      longDescription: values.longDescription.trim(),
      moq: values.moq.trim(),
      featured: values.featured,
      categoryId: Number(values.categoryId)
    });
    navigate("/products");
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="Product Create"
        subtitle="Create a new product entry with complete catalog details."
      />
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      <ProductForm
        title="Create Product"
        categories={categories}
        initialValues={{
          ...initialValues,
          categoryId: String(categories[0]?.id ?? "")
        }}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/products")}
        submitLabel="Save Product"
      />
    </section>
  );
}
