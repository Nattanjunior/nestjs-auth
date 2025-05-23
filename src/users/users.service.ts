import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt'
import { CaslService } from 'src/casl/casl.service';
import { accessibleBy } from '@casl/prisma';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private abilityService: CaslService
  ) { }

  create(createUserDto: CreateUserDto) {

    const ability = this.abilityService.ability;

    if (!ability.can('create', 'User')) {
      throw new Error('Unauthorized');
    }

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: bcrypt.hashSync(createUserDto.password, 10)
      }
    })
  }

  findAll() {
    const ability = this.abilityService.ability;
    return this.prisma.user.findMany({
      where: {
        AND: [accessibleBy(ability, 'read').User]
      }
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id }
    })
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        password: updateUserDto.password
          ? bcrypt.hashSync(updateUserDto.password, 10)
          : undefined,
      }
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: { id }
    });
  }
}
