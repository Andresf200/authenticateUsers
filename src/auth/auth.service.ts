import { Injectable } from '@nestjs/common';
import { LoginUserDto,CreateUserDto, UpdateUserDto } from './dto';
import {
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {

  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private jwtService: JwtService
    ) {}

  async login({ password, email }: LoginUserDto) {
    try {
      const user = await this.findOne(email);

      if (!user)
        throw new UnauthorizedException('Credentials are not valid(email)');

      if (!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException('Credentials are not valid(password)');

      const payload = { email: user.email };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

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

  async findOne(email: string){
    return await this.usersRepository.findOne({
       where:{email},
       select:{email: true, password: true}
      }) 
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

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
