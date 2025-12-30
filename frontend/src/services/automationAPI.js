import {authenticatedRequest} from "./apiUtils.js";

const API_URL = 'http://localhost:8080/api/dispatch-automation/enabled'

const automationAPI = {
    setAutomation:
        async (isEnabled) => {
            return authenticatedRequest('POST', `${API_URL}?enabled=${encodeURIComponent(isEnabled)}`);
        }
};

export default automationAPI;