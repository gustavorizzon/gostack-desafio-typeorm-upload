import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    return transactions.reduce(
      (balance, transaction) => {
        let { income, outcome, total } = balance;
        const { type, value } = transaction;

        if (type === 'income') {
          income += value;
          total += value;
        } else if (type === 'outcome') {
          outcome += value;
          total -= value;
        }

        return { income, outcome, total };
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );
  }
}

export default TransactionsRepository;
