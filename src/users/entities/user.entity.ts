import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({type: 'text'})
    full_name: string;

    @Column({type: 'text',unique: true})
    email: string;

    @Column({type: 'text', select: false})
    password: string;

    @Column({type: 'text', nullable: true})
    phone?: string;

    @Column({type: 'timestamp',nullable: true})
    is_deleted?: Date;

    @Column({type: 'timestamp',nullable: true})
    update_at?: Date;

    @Column({type: 'timestamp'})
    create_at: Date;


    @BeforeInsert()
    setCreateAt(){
        this.create_at = new Date();
    }

    @BeforeUpdate()
    setUpdateAt(){
        this.update_at = new Date();
    }

}
