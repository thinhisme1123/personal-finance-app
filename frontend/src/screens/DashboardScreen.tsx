import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { getTransactions } from '../services/api';
import SummaryItem from '../components/SummaryItem';
import ChartCard from '../components/ChartCard';
import { colors, spacing, typography, radii, shadows } from '../theme';
import { RootStackParamList } from '../../App';

const screenWidth = Dimensions.get('window').width;

type Transaction = {
  _id: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  note: string;
};

// ─── Helpers ─────────────────────────────────────
function getMonthRange(offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59);
  return { start, end };
}

function filterByMonth(txns: Transaction[], offset: number) {
  const { start, end } = getMonthRange(offset);
  return txns.filter((t) => {
    const d = new Date(t.date);
    return d >= start && d <= end;
  });
}

function sumByType(txns: Transaction[], type: string) {
  return txns.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
}

function pctChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function groupByCategory(txns: Transaction[]) {
  const map: Record<string, number> = {};
  txns.forEach((t) => {
    if (t.type === 'expense') {
      map[t.category] = (map[t.category] || 0) + t.amount;
    }
  });
  return Object.entries(map)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

function formatMoney(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── Component ───────────────────────────────────
export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [all, setAll] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('access_token');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const fetch = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getTransactions();
      setAll(res.data);
    } catch {
      // silent — handled by list screen
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, []),
  );

  // ── Calculations ──
  const thisMonth = filterByMonth(all, 0);
  const lastMonth = filterByMonth(all, -1);

  const incomeThis = sumByType(thisMonth, 'income');
  const incomeLast = sumByType(lastMonth, 'income');
  const expenseThis = sumByType(thisMonth, 'expense');
  const expenseLast = sumByType(lastMonth, 'expense');
  const balance = incomeThis - expenseThis;

  const incomeTrend = pctChange(incomeThis, incomeLast);
  const expenseTrend = pctChange(expenseThis, expenseLast);

  const categories = groupByCategory(thisMonth);

  const now = new Date();
  const thisMonthName = MONTH_NAMES[now.getMonth()];
  const lastMonthName = MONTH_NAMES[(now.getMonth() - 1 + 12) % 12];

  // ── Chart data ──
  const barData = {
    labels: [lastMonthName, thisMonthName],
    datasets: [
      { data: [incomeLast, incomeThis], color: () => colors.income },
      { data: [expenseLast, expenseThis], color: () => colors.expense },
    ],
    legend: ['Income', 'Expense'],
  };

  const pieData = categories.slice(0, 6).map((cat, i) => ({
    name: cat.name,
    amount: cat.total,
    color: colors.chart[i % colors.chart.length],
    legendFontColor: colors.textSecondary,
    legendFontSize: 13,
  }));

  // ── Loading state ──
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  // ── Empty state ──
  const isEmpty = all.length === 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Financial Overview</Text>
            <Text style={styles.month}>{thisMonthName} {now.getFullYear()}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your first transaction to see your financial overview here.
          </Text>
        </View>
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <View style={styles.summaryRow}>
            <SummaryItem
              label="Income"
              amount={formatMoney(incomeThis)}
              icon="📈"
              trend={incomeTrend}
              trendUp={incomeThis >= incomeLast}
              bgColor={colors.incomeBg}
              accentColor={colors.income}
              style={{ marginRight: spacing.sm }}
            />
            <SummaryItem
              label="Expense"
              amount={formatMoney(expenseThis)}
              icon="📉"
              trend={expenseTrend}
              trendUp={expenseThis <= expenseLast}
              bgColor={colors.expenseBg}
              accentColor={colors.expense}
              style={{ marginLeft: spacing.sm }}
            />
          </View>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceLeft}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text
                style={[
                  styles.balanceAmount,
                  { color: balance >= 0 ? colors.income : colors.expense },
                ]}
              >
                {formatMoney(Math.abs(balance))}
              </Text>
            </View>
            <View style={[styles.balanceBadge, { backgroundColor: balance >= 0 ? colors.incomeBg : colors.expenseBg }]}>
              <Text style={[styles.balanceBadgeText, { color: balance >= 0 ? colors.incomeDark : colors.expenseDark }]}>
                {balance >= 0 ? '💰 Surplus' : '⚠️ Deficit'}
              </Text>
            </View>
          </View>

          {/* ── Bar Chart: This vs Last Month ── */}
          <ChartCard
            title="Income vs Expense"
            subtitle={`${lastMonthName} → ${thisMonthName} comparison`}
            style={styles.chartSection}
          >
            <BarChart
              data={barData}
              width={screenWidth - spacing.xl * 2 - spacing.lg * 2}
              height={200}
              fromZero
              showValuesOnTopOfBars
              withInnerLines={false}
              yAxisLabel="$"
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: colors.surface,
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                labelColor: () => colors.textSecondary,
                barPercentage: 0.6,
                propsForLabels: { fontSize: 12 },
              }}
              style={{ borderRadius: radii.md }}
            />
          </ChartCard>

          {/* ── Pie Chart: Category Breakdown ── */}
          {categories.length > 0 && (
            <ChartCard
              title="Spending by Category"
              subtitle={`${thisMonthName} expense breakdown`}
              style={styles.chartSection}
            >
              <PieChart
                data={pieData}
                width={screenWidth - spacing.xl * 2 - spacing.lg * 2}
                height={200}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="0"
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                absolute
              />
              {/* Category list below the pie */}
              <View style={styles.categoryList}>
                {categories.map((cat, i) => {
                  const total = categories.reduce((s, c) => s + c.total, 0);
                  const pct = total > 0 ? ((cat.total / total) * 100).toFixed(1) : '0';
                  return (
                    <View key={cat.name} style={styles.categoryRow}>
                      <View style={styles.categoryLeft}>
                        <View style={[styles.categoryDot, { backgroundColor: colors.chart[i % colors.chart.length] }]} />
                        <Text style={styles.categoryName}>{cat.name}</Text>
                      </View>
                      <View style={styles.categoryRight}>
                        <Text style={styles.categoryAmount}>{formatMoney(cat.total)}</Text>
                        <Text style={styles.categoryPct}>{pct}%</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ChartCard>
          )}
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingTop: 56,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    ...typography.h1,
  },
  month: {
    ...typography.caption,
    marginTop: 4,
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.sm,
    backgroundColor: colors.expenseBg,
    marginTop: 4,
  },
  logoutText: {
    color: colors.expense,
    fontSize: 13,
    fontWeight: '600',
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    marginBottom: spacing.base,
  },

  // Balance
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  balanceLeft: {},
  balanceLabel: {
    ...typography.caption,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 26,
    fontWeight: '800',
  },
  balanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  balanceBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Charts
  chartSection: {
    marginBottom: spacing.base,
  },

  // Category list
  categoryList: {
    width: '100%',
    marginTop: spacing.base,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  categoryName: {
    ...typography.body,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryAmount: {
    ...typography.body,
    fontWeight: '600',
  },
  categoryPct: {
    ...typography.caption,
    minWidth: 42,
    textAlign: 'right',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.caption,
    marginTop: spacing.md,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: spacing.base,
  },
  emptyTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
});
