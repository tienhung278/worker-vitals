import { IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class GetVitalsQueryDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(100)
  limit?: number;
}
