import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'bcrypt'

import { User } from './entities/user.entity';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}


  async create(createUserDto: CreateUserDto) : Promise<User> {
    const user: User = new User();
    user.name = createUserDto.name;
    user.username = createUserDto.username;
    user.password = await hash(createUserDto.password, 10);
    user.role = createUserDto.role;

    const userWithSameUsername = await this.userRepository.findOneBy({ username: user.username});
    if(userWithSameUsername) {
      throw new Error(`user with username ${user.username} already exists`)
    }
    return this.userRepository.save(user);
  }

  findAll() : Promise<User[]>  {
    return this.userRepository.find();
  }
}
