import { ServiceUserResponseDto } from "src/service-users/dto/service-user-response.dto";

export class AppResponseDto {
    id: number;
    name: string;
    description: string | null;
    secret: string;
    owner: ServiceUserResponseDto;
    createdAt: Date;
    updatedAt: Date;
}