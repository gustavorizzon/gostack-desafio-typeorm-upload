import parse from 'csv-parse/lib/sync';
import fs from 'fs';
import path from 'path';

import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface Request {
  destination: string;
  filename: string;
  mimetype: string;
}

class ImportTransactionsService {
  async execute({
    destination,
    filename,
    mimetype,
  }: Request): Promise<Transaction[]> {
    if (mimetype !== 'text/csv') {
      throw new AppError('Unsupported import file type.');
    }

    let pendingTransactions = [];
    const filePath = path.resolve(destination, filename);

    try {
      const fileBuffer = await fs.promises.readFile(filePath);

      pendingTransactions = parse(fileBuffer, {
        comment: '#',
        delimiter: ',',
        trim: true,
        skip_empty_lines: true,
        skip_lines_with_empty_values: true,
        skip_lines_with_error: true,
        from_line: 2, // the first line is the header
      });
    } catch {
      throw new AppError('Error processing file data.');
    } finally {
      await fs.promises.unlink(filePath);
    }

    const createTransaction = new CreateTransactionService();
    const importedTransactions = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const pendingTransaction of pendingTransactions) {
      const [title, type, value, categoryTitle] = pendingTransaction;

      // eslint-disable-next-line no-await-in-loop
      const transaction = await createTransaction.execute({
        title,
        type,
        value: parseFloat(value),
        categoryTitle,
      });

      importedTransactions.push(transaction);
    }

    return importedTransactions;
  }
}

export default ImportTransactionsService;
