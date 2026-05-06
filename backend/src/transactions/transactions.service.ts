import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from '../schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async create(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionModel.create({
      userId: new Types.ObjectId(userId),
      ...dto,
      date: dto.date ?? new Date(),
    });
  }

  async findByUser(userId: string): Promise<Transaction[]> {
    return this.transactionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ date: -1 })
      .exec();
  }
}
