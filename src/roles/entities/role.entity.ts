import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({type: 'text'})
    name: string;

    @Column({type: 'timestamp',nullable: true, select: false,default:null})
    is_deleted?: Date;

    @Column({type: 'timestamp',nullable: true})
    update_at?: Date;

    @Column({type: 'timestamp'})
    create_at: Date;

    @BeforeInsert()
    checkFieldsBeforeInserst() {
        this.create_at = new Date();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.update_at = new Date();
    }
}
