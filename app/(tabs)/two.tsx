import { StyleSheet } from "react-native";
import { Text, Surface } from "react-native-paper";

import EditScreenInfo from "@/components/EditScreenInfo";

export default function TabTwoScreen() {
  return (
    <Surface style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Tab Two
      </Text>
      <Surface style={styles.separator} />
      <EditScreenInfo path="app/(tabs)/two.tsx" />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
