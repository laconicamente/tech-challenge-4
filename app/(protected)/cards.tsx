import NoCardSvg from "@/assets/images/no-cards.svg";
import { Card, CardCreateDrawer, CardDetails, CardItem, useCards } from "@/modules/Cards";
import { ColorsPalette } from "@/shared/classes/constants/Pallete";
import ProtectedHeader from "@/shared/components/Header/ProtectedHeader";
import { SkeletonCard } from "@/shared/ui/Skeleton/SkeletonCard";
import { Stack } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const CardsScreen = () => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const { cards, isLoading, updateCard, deleteCard, refetch } = useCards();
  const cardsLoadStartRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!isLoading && cards.length > 0 && cardsLoadStartRef.current) {
      const loadTime = performance.now() - cardsLoadStartRef.current;
      console.log(`[Performance - Cenário 5] Tempo total de carregamento da tela de cartões: ${loadTime.toFixed(2)}ms (${(loadTime / 1000).toFixed(2)}s)`);
      cardsLoadStartRef.current = null;
    }
  }, [isLoading, cards.length]);

  React.useEffect(() => {
    cardsLoadStartRef.current = performance.now();
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<ViewToken<Card>> }) => {
      if (viewableItems.length > 0) {
        setActiveCardIndex(viewableItems[0].index ?? 0);
      }
    },
    [cards]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderCardItem = ({ item }: { item: Card }) => (
    <View style={styles.cardWrapper}>
      <CardItem card={item} />
    </View>
  );

  const EmptyFeedback = () => (
    <View
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        width: "87%",
        flexWrap: "wrap",
      }}
    >
      <NoCardSvg width={220} height={220} />
      <Text
        style={{
          textAlign: "center",
          fontSize: 16,
          color: "#666",
          marginTop: 10,
        }}
      >
        Não encontramos nenhum cartão, que tal criar um novo?
      </Text>
    </View>
  );

  const BankCardSkeleton = () => (
    <View style={styles.cardWrapper}>
      <SkeletonCard style={styles.cardSkeleton} />
    </View>
  );

  const handleUpdateCard = async (id: string, data: Partial<Card>) => {
    try {
      await updateCard(id, data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o cartão. Tente novamente.");
    }
  };

  const handleDeleteCard = (id: string) => {
    Alert.alert("Excluir cartão", "Você tem certeza que deseja excluir este cartão?", [
      { text: "Cancelar" },
      {
        text: "Confirmar exclusão",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCard(id);
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir o cartão. Tente novamente.");
          }
        },
      }
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <ProtectedHeader
              title="Meus cartões"
              hasAction={true}
              iconAction={'plus-circle'}
              onActionPress={() => setVisible(true)}
            />
          ),
          headerShown: true,
        }}
      />
      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
        <FlatList
          data={cards}
          renderItem={renderCardItem}
          keyExtractor={(item) => item.id ?? item.name}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          ListEmptyComponent={
            isLoading ? <BankCardSkeleton /> : <EmptyFeedback />
          }
          style={styles.cardList}
        />

        <View style={styles.pagination}>
          {cards.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeCardIndex === index ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>
        <CardDetails
          isLoading={isLoading}
          card={cards[activeCardIndex] || {}}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
        />
        <CardCreateDrawer
          visible={visible}
          onDismiss={(hasUpdated) => {
            setVisible(false);
            if (hasUpdated) refetch();
          }}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  cardList: {
    display: "flex",
    height: "auto",
    minHeight: 200,
  },
  cardWrapper: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
  },
  cardSkeleton: {
    width: "90%",
    height: 200,
    marginVertical: 20,
    borderRadius: 20,
    backgroundColor: ColorsPalette.light["grey.400"],
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#666",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: ColorsPalette.light["lime.200"],
    width: 14,
  },
});

export default CardsScreen;
