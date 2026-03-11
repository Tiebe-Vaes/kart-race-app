import { StyleSheet } from "react-native";

const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f1115",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 20,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 0,
  },
  card: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  locationText: {
    color: "#f0f6fc",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#30363d",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoColumn: {
    flex: 1,
  },
  label: {
    color: "#8b949e",
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: 4,
    fontWeight: "600",
  },
  value: {
    color: "#c9d1d9",
    fontSize: 15,
    fontWeight: "500",
  },
  seedButton: {
    width: 120,
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#22272e3d",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  seedButtonText: {
    color: "#373737",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default sharedStyles;
