import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: string;
  categoryTitle: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryTitle,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    // Checking types and outcome validation
    if (type !== 'income') {
      if (type === 'outcome') {
        const { total } = await transactionsRepository.getBalance();

        if (value > total) {
          throw new AppError('Insufficient balance.');
        }
      } else {
        throw new AppError('Invalid transaction type.');
      }
    }

    // Checking category existence
    const categoryRepository = getRepository(Category);
    let category = await categoryRepository.findOne({
      where: { title: categoryTitle },
    });

    // If it doesn't exists we create one
    if (!category) {
      category = categoryRepository.create({ title: categoryTitle });
      await categoryRepository.save(category);
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
