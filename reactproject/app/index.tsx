import { Text, View } from "react-native";
import { Link } from "expo-router";

const Index = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Index</Text>
      <Link href="/home" style={{ marginTop: 20, color: 'blue' }}>
        Go to Home
      </Link>
    </View>
  );
}

export default Index;