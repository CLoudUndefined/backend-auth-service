export class RegisterDto {
    email: string;
    password: string;
    recoveryQuestion?: string;
    recoveryAnswer?: string;
}