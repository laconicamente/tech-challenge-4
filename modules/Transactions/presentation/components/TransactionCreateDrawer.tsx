import { useCategories } from '@/modules/Categories';
import { usePaymentMethods } from "@/modules/PaymentMethods";
import { useAuth } from '@/modules/Users';
import { datePickerTheme } from "@/shared/classes/constants/Colors";
import { ColorsPalette } from "@/shared/classes/constants/Pallete";
import { parseCurrencyToNumber } from "@/shared/helpers/formatCurrency";
import { formatDate, toDateFromFirestore } from "@/shared/helpers/formatDate";
import { useFeedbackAnimation } from "@/shared/hooks/useFeedbackAnimation";
import { BytebankButton } from "@/shared/ui/Button";
import { FileUploadButton } from "@/shared/ui/FileUploadButton";
import { BytebankInputController } from "@/shared/ui/Input/InputController";
import { BytebankSelectController } from "@/shared/ui/Select/SelectController";
import { BytebankTabSelector } from "@/shared/ui/TabSelector";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Modal from 'react-native-modal';
import { Divider, PaperProvider, Portal } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { CalendarDate } from "react-native-paper-dates/lib/typescript/Date/Calendar";
import { Transaction, TransactionType } from "../../domain/interfaces/ITransactionRepository";
import { useTransactionManager } from "../contexts/TransactionManagerContext";

const height = Dimensions.get("window").height;

interface TransactionFormData {
    methodId: string;
    categoryId: string;
    createdAt: string | Date;
    value: string | null;
    type: TransactionType;
    fileUrl: string;
}

interface TransactionCreateDrawerProps {
    visible: boolean;
    transaction?: Transaction | null;
    onDismiss: () => void;
}

export const TransactionCreateDrawer: React.FC<TransactionCreateDrawerProps> = ({
    visible,
    transaction = null,
    onDismiss,
}) => {
    const { showFeedback, FeedbackAnimation } = useFeedbackAnimation();
    const [title, setTitle] = useState<string>("");
    const [transactionType, setTransactionType] = useState<TransactionType>(transaction?.type || "income");
    const { user } = useAuth();
    const { refetch, updateTransaction, addTransaction, refetchBalanceValue } = useTransactionManager();
    const { categories } = useCategories(transactionType);
    const { methods } = usePaymentMethods();
    const [isLoading, setIsLoading] = useState(false);

    const formMethods = useForm<TransactionFormData>({
        mode: "onChange",
        defaultValues: {
            methodId: transaction?.methodId || "",
            categoryId: transaction?.categoryId || "",
            createdAt: transaction?.createdAt || "",
            value: transaction?.value ? String(Number(transaction.value)) : null,
            type: transactionType,
            fileUrl: transaction?.fileUrl || "",
        },
    });
    const { setValue, reset, control, handleSubmit, formState } = formMethods;
    const { isValid } = formState;

    useEffect(() => {
        if (transaction) {
            setTransactionType(transaction.type);
            setTitle("Editar transação");
            const transactionDate = transaction.createdAt ? toDateFromFirestore(transaction.createdAt) : undefined;
            reset({
                methodId: transaction.methodId || "",
                categoryId: transaction.categoryId || "",
                createdAt: transactionDate || "",
                value: transaction.value ? String(Number(transaction.value) / 100) : null,
                type: transaction.type,
                fileUrl: transaction.fileUrl || "",
            });
        } else {
            setTransactionType("income");
            resetSettings(transactionType);
            setTitle("Nova transação");
        }
    }, [transaction, reset]);

    const resetSettings = (type: TransactionType = 'income') => reset({ methodId: "", categoryId: "", createdAt: "", value: "", type, fileUrl: "" });

    const handleTabChange = (type: string) => {
        const transactionType = type as TransactionType;
        setTransactionType(transactionType);
        setValue("type", transactionType);
        resetSettings(transactionType);
    }

    const onSubmit = async (data: TransactionFormData) => {
        if (!user) {
            Alert.alert("Ocorreu um erro", "Usuário não autenticado.");
            router.replace("/(auth)/account-access");
            return;
        }

        setIsLoading(true);
        try {
            const isValueNaN = isNaN(parseFloat(String(data.value)));
            const formattedValue: string | number  = (!isValueNaN ? transaction?.value ?? data.value : parseCurrencyToNumber(data.value) * 100) || 0;
            const createdAtDate = typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt;
            const newTransaction = { ...data, value: Number(formattedValue), userId: user.uid, createdAt: createdAtDate };
            if (transaction?.id) {
                await updateTransaction?.(transaction?.id, newTransaction);
            } else {
                await addTransaction?.(newTransaction);
            }

            showFeedback("success");
            onDismiss();
            refetch?.();
            refetchBalanceValue?.();
        } catch (error) {
            console.error("Erro ao adicionar transação: ", error);
            showFeedback("error");
        } finally {
            setIsLoading(false);
            resetSettings(transactionType);
        }
    };

    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

    const onDateDismiss = () => setIsDatePickerVisible(false);

    return (
        <Portal>
            <Modal
                isVisible={visible}
                onDismiss={onDismiss}
                style={styles.modal}
                onBackdropPress={onDismiss}
                backdropTransitionOutTiming={0}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationInTiming={100}
                animationOutTiming={0}
                avoidKeyboard={true}
                swipeDirection="down"
                onSwipeComplete={onDismiss}
                propagateSwipe={true}
            >
                <View style={styles.card}>
                    <View style={styles.dragHandle} />
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                    </View>
                    <Divider />
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={{ display: 'flex', gap: 0 }}>
                            <FormProvider {...formMethods}>
                                <BytebankTabSelector
                                    tabs={[
                                        { label: "Entrada", name: "income" },
                                        { label: "Saída", name: "expense" },
                                    ]}
                                    activeTab={transactionType}
                                    disabled={transaction !== null}
                                    onTabChange={handleTabChange}
                                />
                                {methods && methods.length > 0 ?
                                    (<BytebankSelectController
                                        name={"methodId"}
                                        label="Tipo da transação"
                                        items={methods.map(c => ({ label: c.name, value: c.id || '' }))}
                                        placeholder="Selecione o tipo da transação"
                                        rules={{ required: "Tipo da transação é obrigatório" }}
                                    />
                                    ) : (null)}
                                <View style={{ marginVertical: 20 }}>
                                    <Controller
                                        name="createdAt"
                                        control={control}
                                        rules={{ required: "Data da transação é obrigatória" }}
                                        render={({ field, fieldState: { error } }) => (
                                            <View>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Text style={{ marginLeft: 10, fontWeight: 500 }}>Data da transação</Text>
                                                    <TouchableOpacity onPress={() => setIsDatePickerVisible(true)} >
                                                        <View style={{ alignItems: 'flex-end', width: '100%' }}>
                                                            {field.value ? <Text style={{ fontWeight: 400, justifyContent: 'flex-end' }} >
                                                                {formatDate(field.value)}
                                                            </Text> : <Text style={{ fontWeight: 'bold', justifyContent: 'flex-end' }} >Adicionar data</Text>}
                                                        </View>
                                                    </TouchableOpacity>
                                                    {field.value && <View style={{ alignItems: 'flex-end', width: '100%' }}>
                                                        <TouchableOpacity onPress={() => setIsDatePickerVisible(true)} >
                                                            <Text style={{ fontWeight: 'bold', justifyContent: 'flex-end' }} >
                                                                Alterar data
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>}
                                                </View>
                                                {error?.message ? (
                                                    <Text style={{ color: '#d32f2f', fontSize: 12, marginLeft: 10, marginTop: 2 }}>
                                                        {error.message}
                                                    </Text>
                                                ) : null}
                                                <PaperProvider theme={datePickerTheme}>
                                                    <DatePickerModal
                                                        locale="pt-BR"
                                                        mode="single"
                                                        visible={isDatePickerVisible}
                                                        onDismiss={onDateDismiss}
                                                        onConfirm={({ date }) => {
                                                            setIsDatePickerVisible(false);
                                                            if (date) field.onChange(date);
                                                        }}
                                                        startDate={field.value as unknown as CalendarDate}
                                                        label="Selecione uma data"
                                                        startLabel="Data da transação"
                                                        saveLabel="Selecionar"
                                                    />
                                                </PaperProvider>
                                            </View>
                                        )}
                                    />
                                </View>
                                <BytebankInputController
                                    type='text'
                                    name="value"
                                    label="Valor"
                                    placeholder="R$ 0,00"
                                    maskType="currency"
                                    rules={{
                                        required: "Valor é obrigatório", validate: (v) => {
                                            const num = parseCurrencyToNumber(v);
                                            if (!num || num <= 0) return "O valor deve ser maior que zero";
                                            if (num > 1000000) return "O valor máximo é R$ 1.000.000";
                                            return true;
                                        }
                                    }}
                                    keyboardType="number-pad"
                                />
                                {categories && categories.length > 0 && (
                                    <BytebankSelectController
                                        name="categoryId"
                                        label="Categoria"
                                        items={categories.map(c => ({ label: c.name, value: c.id || '' }))}
                                        placeholder="Selecione uma categoria"
                                        rules={{ required: "Categoria é obrigatória" }}
                                    />
                                )}
                                <View style={{ marginVertical: 20 }}>
                                    <Text style={{ fontWeight: 500, marginLeft: 10 }}>Se preferir, inclua o comprovante da transação: </Text>
                                    <Controller
                                        name="fileUrl"
                                        control={control}
                                        render={({ field }) => (
                                            <FileUploadButton label={field.value ? 'Comprovante adicionado' : 'Adicionar comprovante'} onFinished={(v) => { field.onChange(v); showFeedback('success'); }} />
                                        )}
                                    />
                                </View>
                            </FormProvider>
                        </View>
                    </ScrollView>
                    <View style={{ paddingVertical: 15 }}>
                        <BytebankButton
                            color="primary"
                            variant="contained"
                            onPress={handleSubmit(onSubmit)}
                            disabled={isLoading || !isValid}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={ColorsPalette.light['lime.800']} />
                            ) : (
                                "Concluir"
                            )}
                        </BytebankButton>
                    </View>
                </View>
            </Modal>
            <FeedbackAnimation />
        </Portal>
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContainer: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: 'auto',
        zIndex: 999,
    },
    animatedView: {
        width: "100%",
        justifyContent: "flex-end",
    },
    card: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 90,
        width: "100%",
        minHeight: height * 0.9,
        display: "flex",
        alignContent: "space-between",
        flexDirection: "column",
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: "#ccc",
        borderRadius: 5,
        alignSelf: "center",
        marginBottom: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
    },
});