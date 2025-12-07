import { ColorsPalette } from '@/shared/classes/constants/Pallete';
import { maskCardNumber } from '@/shared/helpers/maskCardNumber';
import { SkeletonAvatar } from '@/shared/ui/Skeleton/SkeletonAvatar';
import { SkeletonText } from '@/shared/ui/Skeleton/SkeletonText';
import { MaterialIcons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../domain/interfaces/ICardRepository';

interface CardDetailsProps {
    isLoading: boolean;
    card: Partial<Card>;
    onUpdate: (id: string, data: Partial<Card>) => void;
    onDelete: (id: string) => void;
}

export const CardDetails = ({ 
    isLoading, 
    card, 
    onUpdate, 
    onDelete 
}: CardDetailsProps) => {
    
    if (isLoading) {
        return (
            <View style={{...styles.container, minHeight: 280}}>
                {[...Array(4)].map((_, index) => (
                    <SkeletonText key={index} style={{ width: '100%', height: 20, marginBottom: 20 }} />
                ))}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {[...Array(3)].map((_, index) => (
                        <SkeletonAvatar key={index} style={{ width: 50, height: 50, marginBottom: 20 }} />
                    ))}
                </View>
            </View>
        );
    }
    
    if (!card || !card.id) return null;

    const cardDetailsList = [
        { label: 'Apelido', value: card.name },
        { label: 'Número', value: maskCardNumber(card.number ?? '') },
        { label: 'Validade', value: card.expiredAt },
        { label: 'CVV', value: card.cvv },
    ];

    const handleToggleBlock = () => {
        onUpdate(card.id!, { blocked: !card.blocked });
    };

    const handleTogglePrincipal = () => {
        onUpdate(card.id!, { principal: !card.principal });
    };

    const handleDelete = () => {
        onDelete(card.id!);
    };

    return (
        <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                <View>
                    {cardDetailsList.map((detail, index) => (
                        <View style={styles.cardDetails} key={index}>
                            <Text style={styles.cardLabel}>{detail.label}</Text>
                            <Text style={styles.cardValue}>{detail.value}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.actionButtonsContainer}>
                    <View style={styles.actionButtonWrapper}>
                        <TouchableOpacity 
                            style={styles.actionButton} 
                            onPress={handleToggleBlock}
                        >
                            <MaterialIcons 
                                name={card.blocked ? "lock-open" : "lock"} 
                                size={20} 
                                color={ColorsPalette.light['lime.100']} 
                            />
                        </TouchableOpacity>
                        <Text style={styles.actionButtonText}>
                            {card.blocked ? 'Desbloquear cartão' : 'Bloquear cartão'}
                        </Text>
                    </View>
                    <View style={styles.actionButtonWrapper}>
                        <TouchableOpacity 
                            style={styles.actionButton} 
                            onPress={handleTogglePrincipal}
                        >
                            <MaterialIcons 
                                name="credit-card" 
                                size={20} 
                                color={ColorsPalette.light['lime.100']} 
                            />
                        </TouchableOpacity>
                        <Text style={styles.actionButtonText}>
                            {card.principal ? 'Desmarcar como principal' : 'Marcar como principal'}
                        </Text>
                    </View>
                    <View style={styles.actionButtonWrapper}>
                        <TouchableOpacity 
                            style={styles.actionDeleteButton} 
                            onPress={handleDelete}
                        >
                            <MaterialCommunityIcons 
                                name="card-remove-outline" 
                                size={20} 
                                color={ColorsPalette.light['lime.800']} 
                            />
                        </TouchableOpacity>
                        <Text style={styles.deleteButtonText}>Excluir cartão</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 40
    },
    cardDetails: {
        paddingVertical: 5,
    },
    cardLabel: {
        fontSize: 15,
        color: '#666',
    },
    cardValue: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#111'
    },
    actionButtonsContainer: {
        marginTop: 20,
        gap: 15,
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    actionButtonWrapper: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%'
    },
    actionButton: {
        backgroundColor: ColorsPalette.light['lime.800'],
        padding: 15,
        borderRadius: 30,
        alignItems: 'center',
        width: 60,
        height: 60,
        justifyContent: 'center',
    },
    actionDeleteButton: {
        backgroundColor: ColorsPalette.light['lime.200'],
        padding: 15,
        borderRadius: 30,
        alignItems: 'center',
        width: 60,
        height: 60,
        display: 'flex',
        justifyContent: 'center',
    },
    actionButtonText: {
        color: ColorsPalette.light['lime.800'],
        fontSize: 14,
        textAlign: 'center'
    },
    deleteButtonText: {
        color: ColorsPalette.light['lime.700'],
        textAlign: 'center',
        fontSize: 14,
    },
});