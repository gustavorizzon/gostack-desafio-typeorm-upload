import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactionExists = await transactionsRepository.findOne(id);
    if (!transactionExists) {
      throw new AppError('Transaction does not exist.');
    }

    await transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
