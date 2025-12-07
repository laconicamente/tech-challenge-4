import { BankCardFlag, BankCardType } from '@/modules/Cards/domain/interfaces/IBankCard';
import { useAuth } from '@/modules/Users';
import { useFeedbackAnimation } from '@/shared/hooks/useFeedbackAnimation';
import { BytebankDrawer } from '@/shared/ui/Drawer';
import { BytebankInputController } from '@/shared/ui/Input/InputController';
import { BytebankSelectController } from '@/shared/ui/Select/SelectController';
import { SkeletonText } from '@/shared/ui/Skeleton/SkeletonText';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Portal } from 'react-native-paper';
import { useCards } from '../hooks/useCards';

interface CardCreateDrawerProps {
    visible: boolean;
    onDismiss: (value?: boolean) => void;
}

type CardFormData = {
    number: string;
    expiredAt: string;
    name: string;
    cvv: number | undefined;
    type: BankCardType;
    blocked: boolean;
    principal: boolean;
    flag: BankCardFlag;
};

export const CardCreateDrawer = ({
    visible,
    onDismiss,
}: CardCreateDrawerProps) => {
    const { user } = useAuth();
    const { addCard } = useCards();
    const types: BankCardType[] = ["Platinum", "Gold", "Black"];
    const formMethods = useForm<CardFormData>({
        mode: "onChange",
        defaultValues: {
            number: "",
            expiredAt: "",
            name: "",
            cvv: undefined,
            type: "Platinum" as BankCardType,
            blocked: false,
            principal: false,
            flag: BankCardFlag.Visa
        },
    });
    const { showFeedback, FeedbackAnimation } = useFeedbackAnimation();
    const [isLoading, setIsLoading] = useState(false);

    const { reset, handleSubmit } = formMethods;
    const { isValid } = formMethods.formState;

    const handleClearForm = () => {
        reset({
            number: "",
            expiredAt: "",
            name: "",
            cvv: undefined,
            type: "Platinum" as BankCardType,
            blocked: false,
            principal: false,
            flag: BankCardFlag.Visa
        });
        onDismiss(false);
    };

    const handleCreateCard = async (data: CardFormData) => {
        if (!user?.uid) {
            console.error("Usuário não autenticado");
            showFeedback("error");
            return;
        }

        setIsLoading(true);
        try {
            await addCard({
                userId: user.uid,
                number: data.number,
                name: data.name,
                cvv: Number(data.cvv),
                expiredAt: data.expiredAt,
                type: data.type,
                flag: data.flag,
                blocked: data.blocked || false,
                principal: data.principal || false,
            });

            showFeedback("success");
            handleClearForm();
            onDismiss(true);
        } catch (error) {
            console.error("Erro ao adicionar cartão: ", error);
            showFeedback("error");
            setIsLoading(false);
        }
    };

    return (
        <>
            <BytebankDrawer 
                title='Adicionar cartão' 
                confirmLabel='Salvar' 
                onDismiss={handleClearForm} 
                onCancel={handleClearForm} 
                onSubmit={handleSubmit(handleCreateCard)} 
                visible={visible} 
                disabled={isLoading || !isValid}
            >
                <FormProvider {...formMethods}>
                    <View style={styles.sectionInput}>
                        {types.length > 0 ? (
                            <BytebankSelectController
                                name="type"
                                label="Selecione o tipo do cartão"
                                items={types.map(type => ({ label: type, value: type }))}
                                placeholder="Selecione o tipo do cartão"
                                rules={{ required: "Tipo do cartão é obrigatório" }}
                            />
                        ) : (
                            <SkeletonText style={{ height: 30 }} />
                        )}
                    </View>
                    <View style={styles.sectionInput}>
                        <BytebankInputController
                            label="Apelido do cartão"
                            placeholder="Digite o apelido do cartão"
                            name="name"
                            rules={{ required: "Apelido do cartão é obrigatório" }}
                        />
                    </View>
                    <View>
                        <BytebankInputController
                            label="Número do cartão"
                            placeholder="XXXX XXXX XXXX XXXX"
                            name="number"
                            keyboardType='number-pad'
                            maskType='card'
                            maxLength={19}
                            rules={{ required: "Número do cartão é obrigatório" }}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <View style={styles.input}>
                            <BytebankInputController
                                label="Expira em"
                                placeholder="MM/AA"
                                name="expiredAt"
                                keyboardType='number-pad'
                                maxLength={5}
                                maskType='expiry'
                                rules={{ required: "Data de expiração é obrigatório" }}
                            />
                        </View>
                        <View style={styles.input}>
                            <BytebankInputController
                                label="CVV"
                                placeholder="Digite o CVV"
                                name="cvv"
                                keyboardType='number-pad'
                                maskType='cvv'
                                maxLength={4}
                                secureTextEntry
                                rules={{ required: "CVV é obrigatório" }}
                            />
                        </View>
                    </View>
                </FormProvider>
            </BytebankDrawer>
            <Portal>
                <FeedbackAnimation />
            </Portal>
        </>
    );
};

const styles = StyleSheet.create({
    sectionInput: {
        marginTop: 16
    },
    inputContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    input: {
        flex: 1,
    },
});