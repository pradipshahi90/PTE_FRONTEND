const BASE_URL = import.meta.env.VITE_BASE_API_URL;

export class Api {
    static BASE_URL = BASE_URL;
    static LOGIN = `${Api.BASE_URL}/auth/login`;
    static REGISTER = `${Api.BASE_URL}/auth/register`;

}
