import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || "Zoeken..."}
        placeholderTextColor="#8b949e"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  input: {
    backgroundColor: "#161b22",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#30363d",
    color: "#f0f6fc",
    fontSize: 15,
  },
});

export default SearchBar;
