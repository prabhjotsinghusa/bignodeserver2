
export interface Buyer {
  buyer_id: number;
  name: string;
  email: string;
  password: string;
  address: string;
  contact: string;
  created_at: Date;
  pub_id: number;
  status: string;
  price_per_call: number;
  buffer_time: number;
}
