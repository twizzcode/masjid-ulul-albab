import assert from "node:assert/strict"

import {
  buildFinanceLedger,
  isFinanceMonth,
  isIsoDate,
  shiftFinanceMonth,
} from "../lib/finance"
import { parseFinanceInput } from "../lib/finance-input"

assert.equal(shiftFinanceMonth("2026-11", 1), "2026-12")
assert.equal(shiftFinanceMonth("2026-01", -1), "2025-12")
assert.equal(isFinanceMonth("2026-11"), true)
assert.equal(isFinanceMonth("2026-13"), false)
assert.equal(isIsoDate("2026-02-29"), false)
assert.equal(isIsoDate("2028-02-29"), true)

assert.deepEqual(
  buildFinanceLedger(1_000_000, [
    {
      id: "1",
      date: "2026-11-01",
      title: "Pemasukan",
      category: "Kas",
      type: "INCOME",
      amount: 500_000,
    },
    {
      id: "2",
      date: "2026-11-02",
      title: "Pengeluaran",
      category: "Kas",
      type: "EXPENSE",
      amount: 250_000,
    },
  ]).map(({ balance }) => balance),
  [1_500_000, 1_250_000]
)

assert.deepEqual(
  parseFinanceInput({
    date: "2026-11-14",
    title: "Infaq Jumat",
    category: "Penerimaan jamaah",
    type: "INCOME",
    amount: 500_000,
  }),
  {
    date: "2026-11-14",
    title: "Infaq Jumat",
    category: "Penerimaan jamaah",
    type: "INCOME",
    amount: 500_000,
  }
)
assert.equal(
  parseFinanceInput({
    date: "2026-11-14",
    title: "X",
    category: "Kas",
    type: "INCOME",
    amount: -1,
  }),
  null
)
assert.equal(
  parseFinanceInput({
    date: "1999-12-31",
    title: "Saldo lama",
    category: "Kas",
    type: "INCOME",
    amount: 1,
  }),
  null
)

console.log("Keuangan checks passed")
