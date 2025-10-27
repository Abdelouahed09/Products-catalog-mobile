import React from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
  onClose: () => void;
};

export default function CategoryModal({
  visible,
  categories,
  selected,
  onSelect,
  onClose,
}: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Select Category</Text>
          <FlatList
            data={categories}
            keyExtractor={(c) => c}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.modalOption,
                  item === selected && styles.modalOptionActive,
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    item === selected && styles.modalOptionTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            )}
            ItemSeparatorComponent={() => (
              <View style={styles.modalSeparator} />
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#0B122099",
    justifyContent: "flex-end",
    paddingBottom: 6,
  },
  modalCard: {
    backgroundColor: "#111827",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    color: "#E5E7EB",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  modalOptionActive: {
    backgroundColor: "#0F172A",
  },
  modalOptionText: {
    color: "#E5E7EB",
    fontSize: 14,
  },
  modalOptionTextActive: {
    color: "#0EA5E9",
    fontWeight: "700",
  },
  modalSeparator: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
});
