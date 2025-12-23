import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserService } from "../modules/user/user.service";
import { User } from "../modules/user/user.entity";
import { LoginDto } from "./dto/login.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
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

    // 加载用户的角色、权限和菜单
    const userWithRoles = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ["roles", "roles.permissions", "roles.menus"],
    });

    // 提取角色代码和权限代码
    const roles: string[] = [];
    const permissions: string[] = [];
    const permissionSet = new Set<string>();

    if (userWithRoles?.roles) {
      userWithRoles.roles.forEach((role) => {
        roles.push(role.code);
        
        // 1. 从独立的权限表中提取权限（role_permissions）
        if (role.permissions) {
          role.permissions.forEach((permission) => {
            permissionSet.add(permission.code);
          });
        }
        
        // 2. 从菜单表中提取权限代码（role_menus）
        // 提取所有有 permissionCode 的菜单（包括按钮类型 menuType === 'F'）
        if (role.menus) {
          role.menus.forEach((menu) => {
            if (menu.permissionCode) {
              permissionSet.add(menu.permissionCode);
            }
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

  /**
   * 获取当前用户信息
   */
  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["roles"],
      select: [
        "id",
        "username",
        "email",
        "nickname",
        "avatar",
        "phone",
        "gender",
        "deptId",
        "postId",
        "loginIp",
        "loginDate",
        "remark",
        "status",
        "isAdmin",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!user) {
      throw new UnauthorizedException("用户不存在");
    }

    // 提取角色代码
    const roles: string[] = [];
    if (user.roles) {
      user.roles.forEach((role) => {
        roles.push(role.code);
      });
    }

    return {
      ...user,
      roles,
    };
  }

  /**
   * 更新个人信息
   */
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("用户不存在");
    }

    // 如果更新邮箱，检查是否已被其他用户使用
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateProfileDto.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException("邮箱已被使用");
      }
    }

    Object.assign(user, updateProfileDto);
    await this.userRepository.save(user);

    // 返回更新后的用户信息（不包含密码）
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * 修改密码
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ["id", "password"],
    });

    if (!user) {
      throw new UnauthorizedException("用户不存在");
    }

    // 验证旧密码
    const isOldPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new BadRequestException("旧密码错误");
    }

    // 检查新密码是否与旧密码相同
    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.password,
    );
    if (isSamePassword) {
      throw new BadRequestException("新密码不能与旧密码相同");
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: "密码修改成功" };
  }

  /**
   * 退出登录（目前只是返回成功，实际应用中可能需要将 token 加入黑名单）
   */
  async logout() {
    // 注意：JWT 是无状态的，如果需要真正的退出登录功能，
    // 需要实现 token 黑名单机制或使用 Redis 存储 token
    return { message: "退出登录成功" };
  }
}
