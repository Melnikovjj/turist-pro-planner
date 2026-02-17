/**
 * Validation Module
 * Provides comprehensive input validation for all user data
 */

export const validators = {
    /**
     * Validate project title
     */
    projectTitle(value) {
        const trimmed = String(value || '').trim();
        if (!trimmed) {
            return { valid: false, error: 'Название проекта обязательно' };
        }
        if (trimmed.length < 3) {
            return { valid: false, error: 'Название должно содержать минимум 3 символа' };
        }
        if (trimmed.length > 100) {
            return { valid: false, error: 'Название не должно превышать 100 символов' };
        }
        return { valid: true, value: trimmed };
    },

    /**
     * Validate date range
     */
    dateRange(startDate, endDate) {
        if (!startDate || !endDate) {
            return { valid: false, error: 'Обе даты обязательны' };
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return { valid: false, error: 'Некорректный формат даты' };
        }

        if (start < now) {
            return { valid: false, error: 'Дата начала не может быть в прошлом' };
        }

        if (start > end) {
            return { valid: false, error: 'Дата начала должна быть раньше даты окончания' };
        }

        // Maximum 90 days
        const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
        if (diffDays > 90) {
            return { valid: false, error: 'Продолжительность похода не может превышать 90 дней' };
        }

        return { valid: true, startDate, endDate, days: diffDays + 1 };
    },

    /**
     * Validate weight value
     */
    weight(value) {
        const num = Number(value);
        if (isNaN(num)) {
            return { valid: false, error: 'Вес должен быть числом' };
        }
        if (num <= 0) {
            return { valid: false, error: 'Вес должен быть больше 0' };
        }
        if (num > 200) {
            return { valid: false, error: 'Вес не может превышать 200 кг' };
        }
        return { valid: true, value: Number(num.toFixed(2)) };
    },

    /**
     * Validate servings
     */
    servings(value) {
        const num = Number(value);
        if (isNaN(num)) {
            return { valid: false, error: 'Порции должны быть числом' };
        }
        if (num <= 0) {
            return { valid: false, error: 'Количество порций должно быть больше 0' };
        }
        if (num > 20) {
            return { valid: false, error: 'Количество порций не может превышать 20' };
        }
        return { valid: true, value: Number(num.toFixed(1)) };
    },

    /**
     * Validate participant name
     */
    participantName(value) {
        const trimmed = String(value || '').trim();
        if (!trimmed) {
            return { valid: false, error: 'Имя участника обязательно' };
        }
        if (trimmed.length < 2) {
            return { valid: false, error: 'Имя должно содержать минимум 2 символа' };
        }
        if (trimmed.length > 50) {
            return { valid: false, error: 'Имя не должно превышать 50 символов' };
        }
        // Only letters, spaces, hyphens
        if (!/^[а-яА-ЯёЁa-zA-Z\s\-]+$/.test(trimmed)) {
            return { valid: false, error: 'Имя может содержать только буквы, пробелы и дефисы' };
        }
        return { valid: true, value: trimmed };
    },

    /**
     * Validate gear item name
     */
    gearName(value) {
        const trimmed = String(value || '').trim();
        if (!trimmed) {
            return { valid: false, error: 'Название предмета обязательно' };
        }
        if (trimmed.length < 2) {
            return { valid: false, error: 'Название должно содержать минимум 2 символа' };
        }
        if (trimmed.length > 100) {
            return { valid: false, error: 'Название не должно превышать 100 символов' };
        }
        return { valid: true, value: trimmed };
    },

    /**
     * Validate chat message
     */
    chatMessage(value) {
        const trimmed = String(value || '').trim();
        if (!trimmed) {
            return { valid: false, error: 'Сообщение не может быть пустым' };
        }
        if (trimmed.length > 500) {
            return { valid: false, error: 'Сообщение не должно превышать 500 символов' };
        }
        return { valid: true, value: trimmed };
    },

    /**
     * Validate URL
     */
    url(value) {
        const trimmed = String(value || '').trim();
        if (!trimmed) {
            return { valid: true, value: '' }; // Optional
        }
        try {
            new URL(trimmed);
            return { valid: true, value: trimmed };
        } catch {
            return { valid: false, error: 'Некорректный URL' };
        }
    },

    /**
     * Validate category
     */
    category(value) {
        const trimmed = String(value || '').trim();
        if (!trimmed) {
            return { valid: false, error: 'Категория обязательна' };
        }
        if (trimmed.length > 50) {
            return { valid: false, error: 'Категория не должна превышать 50 символов' };
        }
        return { valid: true, value: trimmed };
    },

    /**
     * Validate hint/description
     */
    hint(value) {
        const trimmed = String(value || '').trim();
        if (trimmed.length > 200) {
            return { valid: false, error: 'Подсказка не должна превышать 200 символов' };
        }
        return { valid: true, value: trimmed };
    }
};

/**
 * Validate form data object
 */
export function validateForm(data, schema) {
    const errors = {};
    const validated = {};

    for (const [field, validator] of Object.entries(schema)) {
        const result = validator(data[field]);
        if (!result.valid) {
            errors[field] = result.error;
        } else {
            validated[field] = result.value;
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
        data: validated
    };
}

/**
 * Show validation error in UI
 */
export function showFieldError(fieldElement, message) {
    // Remove existing error
    const existingError = fieldElement.parentElement?.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    if (!message) return;

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');

    fieldElement.parentElement?.appendChild(errorDiv);
    fieldElement.classList.add('invalid');
    fieldElement.setAttribute('aria-invalid', 'true');
    fieldElement.setAttribute('aria-describedby', errorDiv.id = `error-${Date.now()}`);
}

/**
 * Clear validation error
 */
export function clearFieldError(fieldElement) {
    const existingError = fieldElement.parentElement?.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    fieldElement.classList.remove('invalid');
    fieldElement.removeAttribute('aria-invalid');
    fieldElement.removeAttribute('aria-describedby');
}
