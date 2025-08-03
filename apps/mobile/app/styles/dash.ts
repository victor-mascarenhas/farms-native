import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f6fa", // igual ao web
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#23272f", // igual ao web
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    width: "48%",
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
  statTitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 8,
  },
  chartCard: {
    marginBottom: 20,
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
  chartTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: "#23272f",
    fontWeight: "600",
  },
  chart: {
    height: 250,
    borderRadius: 8,
    overflow: "hidden",
  },
  webview: {
    backgroundColor: "transparent",
  },
  mapCard: {
    marginBottom: 20,
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
  mapTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: "#23272f",
    fontWeight: "600",
  },
  map: {
    height: 300,
    borderRadius: 8,
    overflow: "hidden",
  },
});
