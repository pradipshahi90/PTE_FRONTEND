const BASE_URL = import.meta.env.VITE_BASE_API_URL;

export class Api {
    static BASE_URL = BASE_URL;
    static LOGIN = `${Api.BASE_URL}/auth/login`;
    static REGISTER = `${Api.BASE_URL}/auth/register`;

    static ADD_READING_MATERIAL = `${Api.BASE_URL}/reading-materials/create`;
    static GET_READING_MATERIAL = `${Api.BASE_URL}/reading-materials`;
    static DELETE_READING_MATERIAL = `${Api.BASE_URL}/reading-materials`;
    static EDIT_READING_MATERIAL = `${Api.BASE_URL}/reading-materials`;

    static GET_USERS = `${Api.BASE_URL}/admin/users`;
    static UPDATE_USER_STATUS = `${Api.BASE_URL}/admin/users`;
    static ADD_USER = `${Api.BASE_URL}/admin/users`;
    static EDIT_USER = `${Api.BASE_URL}/admin/users`;
    static DELETE_USER = `${Api.BASE_URL}/admin/users`;

    static GET_PAYMENT_HISTORY = `${Api.BASE_URL}/payment/history`;

    static GET_EXAM_QUESTIONS = `${Api.BASE_URL}/exam`;
}
