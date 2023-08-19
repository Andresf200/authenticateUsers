import { Matches, Length, IsEmail, IsString, isDate } from "class-validator";

export class CreateUserDto {

    @IsString()
    full_name: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @Length(8, 20)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
     message: 'The password must contain at least one uppercase letter, one lowercase letter and one number.',
    })
    password: string;

    @IsString()
    phone?: string;

}
