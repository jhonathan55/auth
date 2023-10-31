export interface UserI {
    email:string ;
    password:string;
}

export interface UserResponseI extends UserI {
    message: string;
    token: string;
}