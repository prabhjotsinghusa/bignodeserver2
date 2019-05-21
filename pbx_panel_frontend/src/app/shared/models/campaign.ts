export interface Campaign {
    campaign_id: number;
    pub_id: number;
    publisherName: string;
    camp_name: string;
    buffer_time: string;
    price_per_call: number;
    created_at: Date;
    status: string;
    time_zone: string;
    queue_name: string;
    queue_no: string;
    read_only: number;
}
