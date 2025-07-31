import { useEffect, useState } from "react";
import { useProductsStore, Product } from "../src/stores/productsStore";
import { ProtectedRoute } from "../src/components/ProtectedRoute";
import { useForm } from "react-hook-form";

export default function ProductsPage() {
  const {
    products,
    loading,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useProductsStore();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Omit<Product, "id">>();
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onSubmit = async (data: Omit<Product, "id">) => {
    setSucesso("");
    setErro("");
    try {
      if (editId) {
        await updateProduct(editId, { ...data, preco: Number(data.preco) });
        setSucesso("Produto editado com sucesso!");
        setEditId(null);
      } else {
        await addProduct({ ...data, preco: Number(data.preco) });
        setSucesso("Produto cadastrado com sucesso!");
      }
      reset();
    } catch (e) {
      setErro("Erro ao salvar produto.");
    }
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id!);
    setValue("nome", product.nome);
    setValue("preco", product.preco);
    setValue("descricao", product.descricao || "");
    setSucesso("");
    setErro("");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este produto?")) {
      try {
        await deleteProduct(id);
        setSucesso("Produto removido com sucesso!");
        if (editId === id) {
          setEditId(null);
          reset();
        }
      } catch {
        setErro("Erro ao remover produto.");
      }
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: 600, margin: "auto", padding: 24 }}>
        <h1>Produtos</h1>
        <h2 style={{ marginTop: 32 }}>
          {editId ? "Editar Produto" : "Cadastrar Novo Produto"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 12 }}>
            <label>Nome:</label>
            <input
              {...register("nome", { required: true })}
              style={{ width: "100%" }}
            />
            {errors.nome && (
              <span style={{ color: "red" }}>Campo obrigatório</span>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Preço (R$):</label>
            <input
              type="number"
              step="0.01"
              {...register("preco", { required: true, min: 0 })}
              style={{ width: "100%" }}
            />
            {errors.preco && (
              <span style={{ color: "red" }}>Campo obrigatório</span>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Descrição:</label>
            <textarea {...register("descricao")} style={{ width: "100%" }} />
          </div>
          <button type="submit" style={{ width: "100%" }}>
            {editId ? "Salvar Alterações" : "Cadastrar"}
          </button>
          {editId && (
            <button
              type="button"
              style={{
                width: "100%",
                marginTop: 8,
                background: "#e5e7eb",
                color: "#111827",
                border: "none",
                borderRadius: 4,
                padding: 10,
                cursor: "pointer",
              }}
              onClick={() => {
                setEditId(null);
                reset();
                setSucesso("");
                setErro("");
              }}
            >
              Cancelar Edição
            </button>
          )}
          {sucesso && (
            <div style={{ color: "green", marginTop: 8 }}>{sucesso}</div>
          )}
          {erro && <div style={{ color: "red", marginTop: 8 }}>{erro}</div>}
        </form>
        <h2>Produtos Cadastrados</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <ul>
            {products.slice(0, 20).map((product) => (
              <li key={product.id}>
                <strong>{product.nome}</strong> - R$ {product.preco}
                {product.descricao && <span> - {product.descricao}</span>}
                <button
                  style={{
                    marginLeft: 8,
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    padding: "2px 8px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleEdit(product)}
                >
                  Editar
                </button>
                <button
                  style={{
                    marginLeft: 8,
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    padding: "2px 8px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleDelete(product.id!)}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ProtectedRoute>
  );
}
