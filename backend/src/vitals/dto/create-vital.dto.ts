import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';

export class CreateVitalDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  workerId?: string;

  @IsInt()
  @IsPositive()
  @Min(20)
  @Max(300)
  heartRate!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(25)
  @Max(45)
  temperature!: number;
}
