import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Logger } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class RolesService {
  private readonly logger = new Logger('RoleService');

  constructor(
      @InjectRepository(Role)
      private readonly roleRepository: Repository<Role>
  ){}

  async create(createRoleDto: CreateRoleDto) {
    try {
      const role = this.roleRepository.create(createRoleDto);
      await this.roleRepository.save(role);

      return role;
    } catch (error) { 
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    const roles = await this.roleRepository.find({where: {
      is_deleted: IsNull()
    }});

    return roles;
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOne({
      where:{
        id: id,
        is_deleted: IsNull() 
      }});

    if ( !role ) 
      throw new NotFoundException(`Role with ${ id } not found`);

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    await this.findOne(id);
    const role = await this.roleRepository.preload({
      id:id,
      ...updateRoleDto
    });

    if(!role)
        throw new NotFoundException(`Role with id ${id} not found`);

    try {  
      await this.roleRepository.save(role)
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return role;
  }

  async remove(id: string) {
    await this.findOne(id);

    const role = await this.roleRepository.findOneBy({id});

    if(!role)
      throw new NotFoundException(`Role with id ${id} not found`);

    role.is_deleted = new Date();
    await this.roleRepository.save(role);

    return role;
  }


  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
