import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { validate } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async login(user: any): Promise<Record<string, any>> {
    // Validation Flag
    let isOk = false;

    // Transform body into DTO
    const userDTO = new CreateUserDto();
    userDTO.username = user.username;
    userDTO.password = user.password;

    // Validate DTO against validate function from class-validator
    await validate(userDTO).then((errors) => {
      if (errors.length > 0) {
        throw new Error('something wrong in validation')
      } else {
        isOk = true;
      }
    });

    if (isOk) {
      // Get user information
      const userDetails = await this.usersRepository.findOneBy({
        username: user.username,
      });
      if (userDetails == null) {
        return { status: 401, msg: { msg: 'Invalid credentials' } };
      }

      // Check if the given password match with saved password
      const isValid = await bcrypt.compare(user.password, userDetails.password);
      if (isValid) {
        return {
          status: 200,
          msg: {
            email: user.email,
            access_token: this.jwtService.sign({ email: user.username }),
          },
        };
      } else {
        return { status: 401, msg: { msg: 'Invalid credentials' } };
      }
    } else {
      return { status: 400, msg: { msg: 'Invalid fields.' } };
    }
  }
}