import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserService } from "../modules/user/user.service";
import { User } from "../modules/user/user.entity";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    if (!user.status) {
      throw new UnauthorizedException("用户已被禁用");
    }

    // 加载用户的角色和权限
    const userWithRoles = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ["roles", "roles.permissions"],
    });

    // 提取角色代码和权限代码
    const roles: string[] = [];
    const permissions: string[] = [];
    const permissionSet = new Set<string>();

    if (userWithRoles?.roles) {
      userWithRoles.roles.forEach((role) => {
        roles.push(role.code);
        if (role.permissions) {
          role.permissions.forEach((permission) => {
            permissionSet.add(permission.code);
          });
        }
      });
    }

    permissions.push(...Array.from(permissionSet));

    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        roles,
        permissions,
      },
    };
  }
}
