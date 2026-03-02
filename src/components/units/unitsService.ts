import api from '../api/api';
import type {
    Unit,
    CreateUnitPayload,
    UpdateUnitPayload,
    PaginatedResponse,
    DeleteResponse,
    UnitFilters,
} from './unitsType';

class UnitService {
    private baseUrl = '/units';

    getAllUnits(filters: UnitFilters = {}): Promise<PaginatedResponse<Unit>> {
        return api.get(this.baseUrl, { params: filters }).then(res => res.data);
    }

    getUnitById(id: number): Promise<Unit> {
        return api.get(`${this.baseUrl}/${id}`).then(res => res.data.data);
    }

    createNewUnit(data: CreateUnitPayload): Promise<Unit> {
        return api.post(this.baseUrl, data).then(res => res.data.data);
    }

    updateUnitInfo(id: number, data: UpdateUnitPayload): Promise<Unit> {
        return api.put(`${this.baseUrl}/${id}`, data).then(res => res.data.data);
    }

    deleteUnit(id: number): Promise<DeleteResponse> {
        return api.delete(`${this.baseUrl}/${id}`).then(res => res.data);
    }
}

export default new UnitService();