export interface Figure { _id:string; Name:string; Element:string; Variant:boolean; Type:string; Game:string; Image?:string; Boxed?:boolean; Quantity?:number }
export interface UserSummary { id:string; username:string; firstName:string; lastName:string; direction?:'sent'|'received' }
export interface UserData { id:string; username:string; firstName?:string; lastName?:string }
