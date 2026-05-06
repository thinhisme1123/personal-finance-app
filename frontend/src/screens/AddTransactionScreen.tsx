import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { createTransaction } from '../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, spacing, radii, shadows, typography } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddTransaction'>;
};

export default function AddTransactionScreen({ navigation }: Props) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!category.trim()) {
      Alert.alert('Error', 'Please select or enter a category');
      return;
    }

    setLoading(true);
    try {
      await createTransaction({
        amount: parseFloat(amount),
        type,
        category: category.trim(),
        note: note.trim(),
        date: new Date().toISOString(),
      });
      navigation.goBack();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to create transaction';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const getCatIcon = (cat: string) => {
    const map: Record<string, string> = {
      Food: '🍔', Transport: '🚗', Shopping: '🛍️', Bills: '📄',
      Health: '💊', Salary: '💼', Freelance: '💻', Investment: '📊',
      Gift: '🎁', Other: '📦',
    };
    return map[cat] || '💳';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Type Toggle */}
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'expense' && styles.typeBtnExpenseActive]}
            onPress={() => { setType('expense'); setCategory(''); }}
            activeOpacity={0.8}
          >
            <Text style={styles.typeBtnIcon}>📉</Text>
            <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'income' && styles.typeBtnIncomeActive]}
            onPress={() => { setType('income'); setCategory(''); }}
            activeOpacity={0.8}
          >
            <Text style={styles.typeBtnIcon}>📈</Text>
            <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.amountSign, { color: type === 'income' ? colors.income : colors.expense }]}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Category */}
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipIcon}>{getCatIcon(cat)}</Text>
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Or type custom category..."
          placeholderTextColor={colors.textMuted}
          value={category}
          onChangeText={setCategory}
        />

        {/* Note */}
        <Text style={styles.sectionLabel}>Note (optional)</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="What was this for?"
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, type === 'income' ? styles.buttonIncome : styles.buttonExpense]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {type === 'income' ? '+ Add Income' : '- Add Expense'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl, paddingBottom: 40 },

  typeRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: 14,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.card,
  },
  typeBtnExpenseActive: { borderColor: colors.expense, backgroundColor: colors.expenseBg },
  typeBtnIncomeActive: { borderColor: colors.income, backgroundColor: colors.incomeBg },
  typeBtnIcon: { fontSize: 18 },
  typeBtnText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  typeBtnTextActive: { color: colors.textPrimary },

  amountCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  amountLabel: { ...typography.label, marginBottom: spacing.sm },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  amountSign: { fontSize: 28, fontWeight: '800', marginRight: spacing.sm },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    padding: 0,
  },

  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipIcon: { fontSize: 14 },
  chipText: { ...typography.caption, fontSize: 13 },
  chipTextActive: { color: colors.primary, fontWeight: '700' },

  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: spacing.base,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteInput: { height: 80, textAlignVertical: 'top' },

  button: {
    borderRadius: radii.md,
    padding: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.card,
  },
  buttonIncome: { backgroundColor: colors.income },
  buttonExpense: { backgroundColor: colors.expense },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
