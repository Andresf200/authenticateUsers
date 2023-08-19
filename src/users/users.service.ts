import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {

  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
    ){}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = this.usersRepository.create(createUserDto);
      await this.usersRepository.save(user);
      
      return user;

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }


  async findOne(id: string) {
     const user = await this.usersRepository.findOneBy({id});
     if(!user) 
        throw new NotFoundException(`User with id ${id} not found`);

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user  = await this.usersRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if(!user)
        throw new NotFoundException(`User with id ${id} not found`);

    try {  
      await this.usersRepository.save(user)
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return user;
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOneBy({id});

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    user.is_deleted = new Date();
    await this.usersRepository.save(user);

    return user;
  }

  private handleDBExceptions(error:any){
    if(error.code === '23505')
        throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs'); 
  }
}
