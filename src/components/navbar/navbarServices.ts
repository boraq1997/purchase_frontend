import api from '../api/api';

class navbarService {
    updateUserPassword(payload: any){
        return api.post('/change-password', payload).then(res=>res.data);
    }

    getUserProfileInfo() {
        return api.get('/me');
    }

    getUserPermission() {
        return api.get('/debug-permissions');
    }
}

export default new navbarService();