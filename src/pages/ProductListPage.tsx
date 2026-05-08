import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import {
  fetchAdminProductsWithFiltersApi,
  fetchCategoriesApi,
  readErrorMessage
} from "../lib/api";
import type { AdminProduct, Category } from "../types/domain";

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
        title="Product List"
        subtitle="Manage product records with compact, production-ready controls."
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
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
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

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {loading ? <p>Loading products...</p> : null}

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
                  {product.price === null ? "0.00" : product.price.toFixed(2)}
                  {` / ${product.priceUnit}`}
                </td>
                <td>{product.defaultTaxRate ?? 0}</td>
                <td>{product.defaultDiscountRate ?? 0}</td>
                <td>
                  <StatusBadge
                    label={product.status}
                    tone={product.status === "ACTIVE" ? "success" : "warning"}
                  />
                </td>
                <td>{product.categoryName}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      ) : null}
    </section>
  );
}
