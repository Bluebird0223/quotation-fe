import axios from "axios";

const nodeEnvironment = import.meta.env.VITE_NODE_ENV
const serverUrl = import.meta.env.VITE_NODE_URL;

export const getToken = () => {
    return localStorage.getItem('quotationToken') || null;
};

export const getServerUrl = () => serverUrl;


// export function getServerUrl() {
//     if (nodeEnvironment === "development") {
//         return serverUrl;
//     }

//     if (nodeEnvironment === "machine_IP") {
//         return serverUrl;
//     }

//     if (nodeEnvironment === "server") {
//         return serverUrl;
//     }

//     return serverUrl;
// }

export const communication = {

    // user
    loginUser: async function (email, password) {
        try {
            return axios.post(`${getServerUrl()}/api/user/login`, { email, password }, {
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${getCookie(token)}`
                },
            });
        } catch (error) {
            console.error(error?.message);
        }
    },

    getAllUsers: async function () {
        try {
            return axios.get(`${getServerUrl()}/api/user/get-all-users`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
            });
        } catch (error) {
            console.error(error?.message);
        }
    },

    createUser: async function (dataToSend) {
        try {
            return axios.post(`${getServerUrl()}/api/user/create-user`, dataToSend, {
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${getCookie(token)}`
                },
            });
        } catch (error) {
            console.error(error?.message);
        }
    },

    updateUser: async function (dataToSend) {
        try {
            return axios.post(`${getServerUrl()}/api/user/update-user`, dataToSend, {
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${getCookie(token)}`
                },
            });
        } catch (error) {
            console.error(error?.message);
        }
    },

    deleteUser: async function (id) {
        try {
            return axios.post(`${getServerUrl()}/api/user/delete-user`, id, {
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${getCookie(token)}`
                },
            });
        } catch (error) {
            console.error(error?.message);
        }
    },

    // item
    createItem: async function (itemData) {
        try {
            return axios.post(`${getServerUrl()}/api/item/create-item`, itemData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    // Authorization: `Bearer ${getCookie(token)}`
                },
            });
        } catch (error) {
            console.error(error?.message);
        }
    },

    getAllItem: async function () {
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${getCookie(token)}`
                }
            }
            return axios.get(`${getServerUrl()}/api/item/get-item`, config)
        } catch (error) {
            return { data: { success: false, message: error.message } };
        }
    },

    updateItem: async function (itemData) {
        try {
            return axios.put(`${getServerUrl()}/api/item/update-item`, itemData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    // Authorization: `Bearer ${getCookie(token)}`
                },
            });
        } catch (error) {
            console.error(error?.message);
        }
    },

    deleteItem: async function (id) {
        try {
            return axios.post(`${getServerUrl()}/api/item/delete-item`, { id }, {
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${getCookie(token)}`
                },
            });
        } catch (error) {
            console.error(error?.message);
        }
    },

    // quotation
    getAllQuotation: async function () {
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${getCookie(token)}`
                }
            }
            return axios.get(`${getServerUrl()}/api/quotation/get-quotation`, config)
        } catch (error) {
            return { data: { success: false, message: error.message } };
        }
    },

    getQuotationById: async function (id) {
        try {
            return axios.post(`${getServerUrl()}/api/quotation/get-quotation-by-id`, { id }, {
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${getCookie(token)}`
                },
            });
        } catch (error) {
            console.error(error?.message);
        }
    },

    addQuotation: async function (dataToSend) {
        try {
            return axios.post(`${getServerUrl()}/api/quotation/create-quotation`, dataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    // Authorization: `Bearer ${getCookie(token)}`
                },
            });
        } catch (error) {
            console.error(error?.message);
        }
    },

    updateQuotation: async function (dataToSend) {
        try {
            return axios.put(`${getServerUrl()}/api/quotation/update-quotation`, dataToSend, {
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${getCookie(token)}`
                },
            });
        } catch (error) {
            console.error(error?.message);
        }
    },

    deleteQuotation: async function (id) {
        try {
            return axios.post(`${getServerUrl()}/api/quotation/delete-quotation`, { id }, {
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${getCookie(token)}`
                },
            });
        } catch (error) {
            console.error(error?.message);
        }
    },

    uploadImage: (formData) => {
        return axios.post(`${getServerUrl()}/api/upload-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // invoice
    createInvoice: (dataToSend) => {
        return axios.post(`${getServerUrl()}/api/invoice/create-invoice`, dataToSend, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },

    getAllInvoices: () => {
        return axios.get(`${getServerUrl()}/api/invoice/get-invoice`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },

    getInvoice: (id) => {
        return axios.post(`${getServerUrl()}/api/invoice/get-invoice-by-id`, { id }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },

    // customer ledger
    getAllCustomers: () => {
        return axios.get(`${getServerUrl()}/api/customer/get-customers`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },
    addCustomer: (dataToSend) => {
        return axios.post(`${getServerUrl()}/api/customer/create-customer`, dataToSend, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },
    deleteCustomer: async function (id) {
        try {
            return axios.post(`${getServerUrl()}/api/customer/delete-customer`, { id }, {
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${getCookie(token)}`
                },
            });
        } catch (error) {
            console.error(error?.message);
        }
    },

}