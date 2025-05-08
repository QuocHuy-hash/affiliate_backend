import { Entity, PrimaryColumn, Column } from 'typeorm';
import 'reflect-metadata';

@Entity()
export class Category {
  @Column()
  category_name!: string;

  @Column()
  category_name_show!: string;

  @Column()
  category_no!: string;

  constructor(data?: Partial<Category>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

@Entity()
export class Coupon {
  @Column()
  coupon_code!: string;

  @Column()
  coupon_desc!: string;

  constructor(data?: Partial<Coupon>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

@Entity()
export class Offer {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  content!: string;

  @Column()
  image!: string;

  @Column()
  aff_link!: string;

  @Column()
  link!: string;

  @Column()
  domain!: string;

  @Column()
  merchant!: string;

  @Column()
  start_time!: string;

  @Column()
  end_time!: string;

  @Column('jsonb')
  categories!: Category[];

  @Column('jsonb')
  coupons!: Coupon[];

  @Column('jsonb')
  banners!: any[];

  @Column({ default: 'coupons' })
  loai_deal!: string;

  constructor(data?: Partial<Offer>) {
    if (data) {
      Object.assign(this, data);
    }
  }
} 