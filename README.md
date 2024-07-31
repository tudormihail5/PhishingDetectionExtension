# Phishing Detection Extension

### What it does:

The phishing detection software is complemented by a Chrome extension as well, making the phishing detection process even easier. When navigating a suspicious website, the user will click the extension icon, and if the website is in English, they will click the 'English'. If not, the other button will be clicked.

![PhishingExtension1](https://github.com/tudormihail5/PhishingDetectionExtension/blob/main/Screenshot1.png)

The extension uses the software's phishing detection methods, and it will display the results when they are ready.

![PhishingExtension2](https://github.com/tudormihail5/PhishingDetectionExtension/blob/main/Screenshot2.png)

![PhishingExtension3](https://github.com/tudormihail5/PhishingDetectionExtension/blob/main/Screenshot3.png)

### How I built it:

- The extension is mainly written in JavaScript, as it manages the communication between the background and the popup and coordinates the buttons and the animation.
- The communication between the extension and the phishing detection software’s backend occurs through API calls.
- Facilitated by AJAX calls to the system’s API, with the 'fetch' function being used to submit URLs for analysis. This includes handling CSRF tokens to ensure secure requests.
- Specifically, the extension interacts with two API endpoints: one for fetching the CSRF token and another for submitting URLs for analysis.

### Challenges I ran into:

- It took a while to connect the extension to the software, as I had to change the settings file of the main application.
- Fetching the CSRF token was quite challenging as well. 
