import { AppRoleResponseDto } from "src/app-roles/dto/app-role-response.dto";

export class AppUserResponseDto {
    id: number;
    email: string;
    role: AppRoleResponseDto | null;
    createdAt: Date;
    updatedAt: Date;
}