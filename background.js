let csrfToken;

function getCsrfToken() {
    // Get the CSRF token from the backend server
    fetch('http://127.0.0.1:8000/csrf_token/', {
        // Include cookies
        credentials: 'include'
    }).then(response => response.json())
    .then(data => {
        // Store the CSRF token inside the global variable
        csrfToken = data.csrfToken;
    }).catch(error => console.error('Error:', error));
}

// Get the CSRF token when the extension is loaded
getCsrfToken();

// Function to listen for messages from popup scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Request to check an URL for phishing
    if (request.action === 'checkPhishing') {
        // Send the request to the server
        checkUrl(request.url, request.isEnglish).then(response => {
            if (response && response.status === 'success') {
                // Send the result back to the popup scripts
                sendResponse({ result: response });
            } else {
                // Handle error
                sendResponse({ error: response ? response.message : 'Unexpected error!' });
            }
        });
        return true;
    }
});

// asynchronous function to allow the JS engine perform other tasks while waiting for the response
async function checkUrl(url, isEnglish) {
    try {
        // Use await to pause the function execution until the network request completes
        const response = await fetch('http://127.0.0.1:8000/store_url/', {
            // Use the fetch API to make a POST request to the server
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken
            },
            credentials: 'include',
            // Send the URL and the 'isEnglish' choice
            body: `url=${encodeURIComponent(url)}&isEnglish=${isEnglish}`
        });
        return response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}
