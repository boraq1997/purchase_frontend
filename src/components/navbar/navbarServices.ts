import api from '../api/api';

class navbarService {
    updateUserPassword(payload: any){
        return api.post('/change-password', payload).then(res=>res.data);
    }
}

export default new navbarService();