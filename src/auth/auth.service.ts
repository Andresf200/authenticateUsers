import { Injectable } from '@nestjs/common';
import { LoginUserDto } from './dto/login-users.dto';
import { UsersService } from 'src/users/users.service';
import {
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  private readonly logger = new Logger('UsersService');

  constructor(
    private userService: UsersService,
    private jwtService: JwtService
    ) {}

  async login({ password, email }: LoginUserDto) {
    try {
      const user = await this.userService.findOne(email);

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

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
