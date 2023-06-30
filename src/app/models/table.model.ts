import { ItemProduct } from "./item.model";

export interface Table{
    id: number;
    name: string;
    note : string;
    status: string;
    createAt: string;
    updateAt: string;
    tableProducts : ItemProduct[]
}