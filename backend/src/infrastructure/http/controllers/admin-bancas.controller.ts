import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BancaService } from '../../../application/services/banca.service';
import {
  CreateBancaDto,
  UpdateBancaDto,
  BancaResponseDto,
  BancaListFilterDto,
} from '../../../application/dtos/banca.dto';
import { BancaStatus } from '../../../domain/entities/banca.entity';

@Controller('admin/bancas')
export class AdminBancasController {
  constructor(private readonly bancaService: BancaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBanca(@Body() dto: CreateBancaDto): Promise<BancaResponseDto> {
    return this.bancaService.createBanca(dto);
  }

  @Get()
  async getAllBancas(@Query() filter: BancaListFilterDto): Promise<BancaResponseDto[]> {
    if (filter.status) {
      return this.bancaService.getBancasByStatus(filter.status);
    }
    return this.bancaService.getAllBancas();
  }

  @Get('pending')
  async getPendingBancas(): Promise<BancaResponseDto[]> {
    return this.bancaService.getBancasByStatus(BancaStatus.PENDING);
  }

  @Get(':id')
  async getBancaById(@Param('id') id: string): Promise<BancaResponseDto> {
    return this.bancaService.getBancaById(id);
  }

  @Put(':id')
  async updateBanca(
    @Param('id') id: string,
    @Body() dto: UpdateBancaDto,
  ): Promise<BancaResponseDto> {
    return this.bancaService.updateBanca(id, dto);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approveBanca(
    @Param('id') id: string,
    @Body('endpoint') endpoint?: string,
  ): Promise<{ banca: BancaResponseDto; credentials: { clientId: string; clientSecret: string; hmacSecret: string } }> {
    return this.bancaService.approveBanca(id, endpoint);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectBanca(@Param('id') id: string): Promise<BancaResponseDto> {
    return this.bancaService.rejectBanca(id);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  async suspendBanca(@Param('id') id: string): Promise<BancaResponseDto> {
    return this.bancaService.suspendBanca(id);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activateBanca(@Param('id') id: string): Promise<BancaResponseDto> {
    return this.bancaService.activateBanca(id);
  }
}
