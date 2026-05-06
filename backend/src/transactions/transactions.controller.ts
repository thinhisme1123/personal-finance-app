import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateTransactionDto) {
    // userId is extracted from the verified JWT — never trust request body for this
    return this.transactionsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.transactionsService.findByUser(req.user.userId);
  }
}
