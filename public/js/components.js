// Reusable Screenshot Button Component
function createScreenshotButton(targetId) {
    return `
        <button class="btn btn-sm btn-outline-secondary"
                onclick="takeScreenshot(document.getElementById('${targetId}'))"
                data-bs-toggle="tooltip"
                data-bs-placement="left"
                title="Take screenshot">
            <i class="bi bi-camera"></i>
        </button>
    `;
}

// Reusable Copy Table Button Component
function createCopyTableButton(tableId) {
    return `
        <button class="btn btn-sm btn-outline-secondary"
                onclick="copyTableToClipboard('${tableId}')"
                data-bs-toggle="tooltip"
                data-bs-placement="left"
                title="Copy table to clipboard">
            <i class="bi bi-clipboard"></i>
        </button>
    `;
}

// Screenshot functionality
async function takeScreenshot(element) {
    try {
        // Find the closest card header button
        const btn = element.querySelector('.card-header .btn');
        if (btn) btn.style.display = 'none';

        // Wait longer for charts to fully render
        await new Promise(resolve => setTimeout(resolve, 500));

        // Take screenshot using dom-to-image
        const dataUrl = await domtoimage.toPng(element, {
            bgcolor: '#ffffff',
            height: element.offsetHeight,
            width: element.offsetWidth,
            style: {
                transform: 'none'
            }
        });

        // Show the button again
        if (btn) btn.style.display = '';

        // Convert dataUrl to blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        try {
            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([item]);
            showToast('Screenshot copied to clipboard!');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            const link = document.createElement('a');
            link.download = 'screenshot.png';
            link.href = dataUrl;
            link.click();
        }
    } catch (error) {
        console.error('Error taking screenshot:', error);
        alert('Failed to take screenshot');
        if (btn) btn.style.display = '';
    }
}

// Copy table functionality
function copyTableToClipboard(tableId) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');

    let text = '';
    rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const rowData = Array.from(cells).map(cell => cell.textContent.trim());
        text += rowData.join('\t') + '\n';
    });

    navigator.clipboard.writeText(text).then(() => {
        showToast('Table copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy table:', err);
        alert('Failed to copy table to clipboard');
    });
}

// Toast notification
function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center text-white bg-success border-0';
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    container.appendChild(toastEl);

    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 3000
    });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
} 