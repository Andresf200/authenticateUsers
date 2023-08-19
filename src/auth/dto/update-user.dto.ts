import { IsEmail, IsString} from "class-validator";

export class UpdateUserDto {
    @IsString()
    full_name: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    phone?: string;
}
