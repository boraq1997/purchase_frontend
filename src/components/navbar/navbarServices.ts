import api from '../api/api';

class navbarService {
    updateUserPassword(payload: any){
        return api.post('/change-password', payload).then(res=>res.data);
    }

    getUserProfileInfo() {
        return api.get('/me');
    }
}

export default new navbarService();