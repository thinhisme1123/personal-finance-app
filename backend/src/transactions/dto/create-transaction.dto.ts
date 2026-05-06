import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsEnum(['income', 'expense'])
  type: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  date?: Date;

  @IsOptional()
  @IsString()
  note?: string;
}
