import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SucursalService } from '../../../application/services/sucursal.service';
import {
  CreateSucursalDto,
  UpdateSucursalDto,
  SucursalResponseDto,
  UpdateTicketConfigDto,
} from '../../../application/dtos/sucursal.dto';

@Controller('api')
export class SucursalController {
  constructor(private readonly sucursalService: SucursalService) {}

  @Post('bancas/:bancaId/sucursales')
  @HttpCode(HttpStatus.CREATED)
  async createSucursal(
    @Param('bancaId') bancaId: string,
    @Body() dto: CreateSucursalDto,
  ): Promise<SucursalResponseDto> {
    return this.sucursalService.createSucursal(bancaId, dto);
  }

  @Get('bancas/:bancaId/sucursales')
  async getSucursalesByBanca(
    @Param('bancaId') bancaId: string,
  ): Promise<SucursalResponseDto[]> {
    return this.sucursalService.getSucursalesByBanca(bancaId);
  }

  @Get('sucursales/:id')
  async getSucursalById(
    @Param('id') id: string,
  ): Promise<SucursalResponseDto> {
    return this.sucursalService.getSucursalById(id);
  }

  @Patch('sucursales/:id')
  async updateSucursal(
    @Param('id') id: string,
    @Body() dto: UpdateSucursalDto,
  ): Promise<SucursalResponseDto> {
    return this.sucursalService.updateSucursal(id, dto);
  }

  @Delete('sucursales/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSucursal(
    @Param('id') id: string,
  ): Promise<void> {
    await this.sucursalService.deactivateSucursal(id);
  }

  @Patch('sucursales/:id/ticket-config')
  async updateTicketConfig(
    @Param('id') id: string,
    @Body() config: UpdateTicketConfigDto,
  ): Promise<SucursalResponseDto> {
    return this.sucursalService.updateTicketConfig(id, config);
  }

  @Post('sucursales/:id/activate')
  @HttpCode(HttpStatus.OK)
  async activateSucursal(
    @Param('id') id: string,
  ): Promise<SucursalResponseDto> {
    return this.sucursalService.activateSucursal(id);
  }
}
