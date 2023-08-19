import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto,CreateUserDto,UpdateUserDto } from './dto';


@Injectable()
export class UsersService {

  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
    ){}

  async create(createUserDto: CreateUserDto) {
    try {
      const {password,...userData} = createUserDto;
      const user = this.usersRepository.create({
        ...userData,
        password: bcrypt.hashSync(password,10)
      });
      await this.usersRepository.save(user);
      delete user.password;
      
      return user;

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }


  async login({password, email}: LoginUserDto) {
    try {
      const user = await this.usersRepository.findOne({
       where:{email},
       select:{email: true, password: true}
      }) 

      if(!user) 
        throw new UnauthorizedException('Credentials are not valid(email)');

      if(!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException('Credentials are not valid(password)');

      return user;
      //Todo retornar jwt
    } catch (error) {
      this.handleDBExceptions(error); 
    }
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
    delete user.password;

    return user;
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOneBy({id});

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    user.is_deleted = new Date();
    await this.usersRepository.save(user);
    delete user.password;

    return user;
  }

  private handleDBExceptions(error:any){
    if(error.code === '23505')
        throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs'); 
  }
}
