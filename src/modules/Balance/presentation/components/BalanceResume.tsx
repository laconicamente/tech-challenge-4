import { useFinancial } from "@/shared/contexts/financial/FinancialContext";
import { formatCurrency } from "@/shared/helpers/formatCurrency";
import { BytebankButton } from "@/shared/ui/Button";
import { SkeletonText } from "@/shared/ui/Skeleton/SkeletonText";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

interface BalanceResumeProps {
  showMinified?: boolean;
}

export const BalanceResume: React.FC<BalanceResumeProps> = ({
  showMinified = false
}) => {
  // Usar o valor do contexto financeiro para garantir sincronização
  const { balanceValue, isLoadingBalance } = useFinancial();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  return (
    <View style={{ padding: 10, minHeight: 100, display: 'flex', justifyContent: 'flex-start', gap: 15 }}>
      {!showMinified && <Text style={{ fontSize: 16, fontWeight: '500' }}>Conta</Text>}
      <View style={{ marginBottom: 10, display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontWeight: '500', fontSize: 22, marginBottom: 5 }}>Saldo em conta</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 30 }}>
            {isLoadingBalance ? (
              <SkeletonText style={{ width: '70%', height: 30 }} />
            ) : (
              isBalanceVisible ? formatCurrency(balanceValue) : "••••••"
            )}
          </Text>
        </View>

        <View>
          <Feather
            name={isBalanceVisible ? "eye" : "eye-off"}
            size={28}
            color="black"
            onPress={toggleBalanceVisibility}
          />
        </View>
      </View>

      {!showMinified && (
        <BytebankButton
          color="secondary"
          styles={{ backgroundColor: '#000' }}
          labelStyles={{ color: 'white' }}
          onPress={() => router.navigate('/(protected)/transactions')}
        >
          Ver extrato completo
        </BytebankButton>
      )}
    </View>
  );
};