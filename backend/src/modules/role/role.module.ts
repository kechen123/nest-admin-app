import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoleService } from "./role.service";
import { RoleController } from "./role.controller";
import { Role } from "./role.entity";
import { Permission } from "../permission/permission.entity";
import { Menu } from "../menu/menu.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, Menu])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
