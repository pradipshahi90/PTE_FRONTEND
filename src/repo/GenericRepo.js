export class GenericRepo {
    async list(api, filter, success, failed) {
        try {
            let url = api;
            if (filter) url += `?${filter}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });

            if (response.status === 401) {
                return;
            }

            if (!response.ok) {
                failed('Something went wrong!');
                return;
            }

            const data = await response.json();
            data.status ? success(data) : failed(data.message || 'Something went wrong');
        } catch (error) {
            failed(error.message);
        }
    }

    async details(api, success, failed) {
        try {
            const response = await fetch(api, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                failed('Something went wrong!');
                return;
            }

            const data = await response.json();
            data.status ? success(data) : failed(data.message || 'Something went wrong');
        } catch (error) {
            failed(error.message);
        }
    }

    async store(api, payload, success, failed) {
        try {
            const response = await fetch(api, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            data.status ? success(data) : failed(data.message || 'Something went wrong', data.errors);
        } catch (error) {
            failed(error.message, {});
        }
    }

    async storeForm(api, formData, success, failed) {
        try {
            const response = await fetch(api, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });

            const data = await response.json();
            data.status ? success(data) : failed(data.message || 'Something went wrong', data.errors);
        } catch (error) {
            failed(error.message, {});
        }
    }

    async update(api, payload, success, failed) {
        try {
            const response = await fetch(api, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            data.status ? success(data.data) : failed(data.message || 'Something went wrong', data.errors);
        } catch (error) {
            failed(error.message, {});
        }
    }

    async updateForm(api, formData, success, failed) {
        try {
            const response = await fetch(api, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });

            const data = await response.json();
            data.status ? success(data.data) : failed(data.message || 'Something went wrong', data.errors);
        } catch (error) {
            failed(error.message, {});
        }
    }

    async destroy(api, success, failed) {
        try {
            const response = await fetch(api, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                },
            });

            const data = await response.json();
            data.status ? success(data.message || 'Successfully deleted!') : failed(data.message || 'Something went wrong');
        } catch (error) {
            failed(error.message);
        }
    }
}