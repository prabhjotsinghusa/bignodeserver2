export interface AdminTransaction {
    pub_id: number;
    amount: number;
    mode_payment: String;
    payment_date: String;
    remark: String;
    createdAt: Date;
    updateAt: Date;
    publisherName: String;
}
