import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions } from '../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, spacing, radii, shadows, typography } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TransactionList'>;
};

type Transaction = {
  _id: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  note: string;
};

export default function TransactionListScreen({ navigation }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      setTransactions(res.data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, []),
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    const map: Record<string, string> = {
      Food: '🍔', Transport: '🚗', Shopping: '🛍️', Bills: '📄',
      Health: '💊', Salary: '💼', Freelance: '💻', Investment: '📊',
      Gift: '🎁', Other: '📦',
    };
    return map[category] || '💳';
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{getCategoryIcon(item.category)}</Text>
      </View>
      <View style={styles.transactionMiddle}>
        <Text style={styles.category}>{item.category}</Text>
        {item.note ? <Text style={styles.note} numberOfLines={1}>{item.note}</Text> : null}
        <Text style={styles.date}>{formatDate(item.date)}</Text>
      </View>
      <Text
        style={[
          styles.amount,
          item.type === 'income' ? styles.income : styles.expense,
        ]}
      >
        {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <Text style={styles.headerSubtitle}>{transactions.length} records</Text>
      </View>

      {/* List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={fetchTransactions}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>Tap the + button to add your first one.</Text>
          </View>
        }
      />

      {/* FAB Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  header: {
    padding: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.base,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h1 },
  headerSubtitle: { ...typography.caption, marginTop: 4 },

  list: { padding: spacing.base, paddingBottom: 100 },

  transactionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconText: { fontSize: 20 },
  transactionMiddle: { flex: 1, marginRight: spacing.md },
  category: { ...typography.body, fontWeight: '600' },
  note: { ...typography.caption, marginTop: 2 },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  amount: { fontSize: 17, fontWeight: '700' },
  income: { color: colors.income },
  expense: { color: colors.expense },

  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.base },
  emptyTitle: { ...typography.h3, marginBottom: spacing.sm },
  emptySubtitle: { ...typography.caption, textAlign: 'center' },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.cardHover,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
