// Fetch the current tab URL when the popup is loaded
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var activeTab = tabs[0];
    // Add event listeners to buttons
    document.getElementById('english-btn').addEventListener('click', function() {
        // Retrieve the URL and the 'English' click
        startAnalysis(activeTab.url, true);
    });
    document.getElementById('not-english-btn').addEventListener('click', function() {
        startAnalysis(activeTab.url, false);
    });
});

function startAnalysis(url, isEnglish) {
    // Hide buttons
    document.getElementById('english-btn').style.display = 'none';
    document.getElementById('not-english-btn').style.display = 'none';
    // Start analysis
    sendUrlToBackground(url, isEnglish);
}

function sendUrlToBackground(url, isEnglish) {
    const analysingMessage = document.getElementById('analysing-message');
    const doneMessage = document.getElementById('done-message');
    const resultElement = document.getElementById('result');
    // Show analysing message
    analysingMessage.style.display = 'block';
    // Send the message to the background scripts
    chrome.runtime.sendMessage({
        action: 'checkPhishing',
        url: url,
        isEnglish: isEnglish
    }, response => {
        // Hide analysing message and show done message
        fadeOutElement(analysingMessage, () => {
            // Callback in 'fadeOutElement'
            fadeInElement(doneMessage, () => {
                // After a delay, hide the done message and show the results
                setTimeout(() => {
                    // Hide done message
                    doneMessage.style.display = 'none';
                    if (response && response.result) {
                        // Display the results
                        displayResults(response.result.detailed_results);
                    } else {
                        resultElement.textContent = 'Unexpected error!';
                    }
                }, 2500);
            });
        });
    });
}

function displayResults(results) {
    const resultElement = document.getElementById('result');
    // Clear previous results
    resultElement.innerHTML = '';
    // Take each result
    results.forEach((result, index) => {
        const [test, outcome] = result;
        // Create a container div for each result
        const resultContainer = document.createElement('div');
        // The second result will swipe in from the right hand side
        if (index === 1) {
            resultContainer.classList.add('swipe-right');
        } else {
            resultContainer.classList.add('swipe-left');
        }
        // Create a span for the outcome 'L' or 'P'
        const outcomeSpan = document.createElement('span');
        outcomeSpan.textContent = outcome === 'L' ? 'Legitimate' : 'Phishing';
        outcomeSpan.className = outcome === 'L' ? 'result-L' : 'result-P';
        // Create a span for the rest of the text
        const textSpan = document.createElement('span');
        textSpan.textContent = ` - ${test}`;
        textSpan.className = 'result-text';
        // Append spans to the result container
        resultContainer.appendChild(outcomeSpan);
        resultContainer.appendChild(textSpan);
        // Append the result container to the result element
        resultElement.appendChild(resultContainer);
    });
}

// HTML animations then execute the callback function
function fadeOutElement(element, callback) {
    element.classList.add('fade-out');
    setTimeout(() => {
        element.style.display = 'none';
        element.classList.remove('fade-out');
        if (callback) callback();
    }, 500);
}

function fadeInElement(element, callback) {
    element.style.display = 'block';
    element.classList.add('fade-in');
    setTimeout(() => {
        element.classList.remove('fade-in');
        if (callback) callback();
    }, 500);
}