
export const formatDate = (dateString) => {
    if (!dateString) return '';

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '';

    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
};

export const getTimeElapsed = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) {
        return 'just now';
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return `${months} month${months !== 1 ? 's' : ''} ago`;
    }

    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
};

export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

export const getInitials = (name) => {
    if (!name) return '';

    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export const formatJobType = (type) => {
    if (!type) return '';

    const types = {
        'full-time': 'Full-Time',
        'internship': 'Internship',
        'internship+ppo': 'Internship + PPO'
    };

    return types[type] || type;
};

export const getStatusColor = (status) => {
    switch (status) {
        case 'applied':
            return '#3498db';
        case 'shortlisted':
            return '#f39c12';
        case 'selected':
            return '#2ecc71';
        case 'rejected':
            return '#e74c3c';
        default:
            return '#95a5a6';
    }
};

export const formatStatus = (status) => {
    if (!status) return 'Not Applied';

    const statusMap = {
        'applied': 'Applied',
        'shortlisted': 'Shortlisted',
        'rejected': 'Rejected',
        'selected': 'Selected',
        'notapplied': 'Not Applied'
    };

    return statusMap[status] || status;
};