export class GenericRepo {
    // Function to get the access token from the cookies
    getAccessToken() {
        const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
        return match ? match[2] : null;
    }

    // Method to add Authorization header with the token if it exists
    addAuthorizationHeader(headers) {
        const token = this.getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    async list(api, filter, success, failed) {
        try {
            let url = api;
            if (filter) {
                const params = new URLSearchParams({ title: filter });
                url += `?${params.toString()}`;
            }

            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            this.addAuthorizationHeader(headers);

            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
            });

            if (response.status === 401) {
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
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            this.addAuthorizationHeader(headers);

            const response = await fetch(api, {
                method: 'GET',
                headers: headers,
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
            const headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            };
            this.addAuthorizationHeader(headers);

            const response = await fetch(api, {
                method: 'POST',
                headers: headers,
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
            const headers = {
                Accept: 'application/json',
            };
            this.addAuthorizationHeader(headers);

            const response = await fetch(api, {
                method: 'POST',
                headers: headers,
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
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            this.addAuthorizationHeader(headers);

            const response = await fetch(api, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            data.status ? success(data) : failed(data.message || 'Something went wrong', data.errors);
        } catch (error) {
            failed(error.message, {});
        }
    }

    async updateForm(api, formData, success, failed) {
        try {
            const headers = {
                Accept: 'application/json',
            };
            this.addAuthorizationHeader(headers);

            const response = await fetch(api, {
                method: 'POST',
                headers: headers,
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
            const headers = {
                Accept: 'application/json',
            };
            this.addAuthorizationHeader(headers);

            const response = await fetch(api, {
                method: 'DELETE',
                headers: headers,
            });

            const data = await response.json();
            data.status ? success(data.message || 'Successfully deleted!') : failed(data.message || 'Something went wrong');
        } catch (error) {
            failed(error.message);
        }
    }
}
