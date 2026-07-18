import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import {
  fetchAdminProductsWithFiltersApi,
  fetchCategoriesApi,
  readErrorMessage
} from "../lib/api";
import { formatEnumLabel } from "../lib/formatters";
import type { AdminProduct, Category } from "../types/domain";

function formatPrice(price: number, priceUnit: string) {
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(price);
  return `${formattedPrice} / ${priceUnit}`;
}

export function ProductListPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "ACTIVE" | "INACTIVE">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategories(await fetchCategoriesApi());
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load categories."));
      }
    }

    void loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const productsResult = await fetchAdminProductsWithFiltersApi({
          search: searchTerm,
          status: statusFilter,
          categoryId: categoryFilter
        });
        setProducts(productsResult);
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load products."));
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
  }, [searchTerm, statusFilter, categoryFilter]);

  const filteredProducts = useMemo(() => products, [products]);

  return (
    <section className="admin-page">
      <PageHeader
        title="Products"
        subtitle="Maintain catalog pricing, availability, categories, and storefront visibility."
        actions={<Link className="button-link" to="/products/new">Create Product</Link>}
      />

      <div className="filter-grid">
        <label>
          Search Products
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, SKU, or slug"
          />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "" | "ACTIVE" | "INACTIVE")}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
        <label>
          Category
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
      </div>

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {loading ? <LoadingState label="Loading products..." /> : null}

      {!loading ? (
        <DataTable isEmpty={filteredProducts.length === 0} emptyText="No products found.">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Tax %</th>
              <th>Discount %</th>
              <th>Status</th>
              <th>Category</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <Link className="record-id-link" to={`/products/${product.id}/edit`}>
                    {product.id}
                  </Link>
                </td>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>
                  {product.price === null ? "Price not set" : formatPrice(product.price, product.priceUnit)}
                </td>
                <td>{product.defaultTaxRate ?? 0}</td>
                <td>{product.defaultDiscountRate ?? 0}</td>
                <td>
                  <StatusBadge
                    label={formatEnumLabel(product.status)}
                    tone={product.status === "ACTIVE" ? "success" : "warning"}
                  />
                </td>
                <td>{product.categoryName}</td>
                <td className="actions-cell">
                  <Link className="button-link button-link-secondary button-small" to={`/products/${product.id}/edit`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      ) : null}
    </section>
  );
}
