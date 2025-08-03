import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#23272f",
  },
  subtitle: {
    color: "#64748b",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  saleCard: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  saleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clientName: {
    fontSize: 18,
    flex: 1,
    color: "#23272f",
    fontWeight: "600",
  },
  saleActions: {
    flexDirection: "row",
  },
  editButton: {
    marginLeft: 8,
  },
  productId: {
    color: "#64748b",
    marginBottom: 12,
  },
  saleDetails: {
    gap: 8,
  },
  detailContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    color: "#64748b",
  },
  detailValue: {
    fontWeight: "bold",
    color: "#3b82f6",
  },
  priceValue: {
    fontWeight: "bold",
    color: "#10b981",
  },
  dateValue: {
    fontWeight: "bold",
    color: "#8b5cf6",
  },
  locationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationValue: {
    fontWeight: "bold",
    color: "#f59e0b",
    fontSize: 12,
  },
  modal: {
    margin: 20,
    marginBottom: 80, // Adiciona margem inferior para não ocupar a barra inferior
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    maxHeight: "85%", // Limita a altura do card
  },
  formScroll: {
    flexGrow: 0,
  },
  formTitle: {
    marginBottom: 20,
    textAlign: "center",
    color: "#23272f",
    fontWeight: "600",
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
    color: "#23272f",
  },
});
